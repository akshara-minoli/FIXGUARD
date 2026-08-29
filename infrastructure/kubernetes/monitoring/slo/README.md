# FixGuard SLI and SLO Engineering

These objectives are portfolio and local-development targets. Docker Desktop
measurements demonstrate the instrumentation and SRE workflow; they are not
evidence that FixGuard has achieved these objectives in production.

| Indicator | Objective | Measurement |
|---|---:|---|
| Required-service availability | 99.9% | Required deployments with an available replica / seven required deployments |
| HTTP non-5xx success | 99.5% | Five-minute non-5xx request rate / total request rate |
| API latency | p95 <= 500 ms | Five-minute histogram quantile across instrumented API requests |
| RabbitMQ dead letters | 0 normally | Sum of messages in queues ending in `.dlq` |

## Application metrics

The six backend services expose an internal `GET /metrics` endpoint using
`prom-client`. Default Node.js process, memory, event-loop, and garbage-collection
metrics use the `fixguard_nodejs_` prefix and a fixed `service` label.

`fixguard_http_requests_total` and
`fixguard_http_request_duration_seconds` use only `service`, `method`, normalized
Express `route`, and `status_code`. Raw URLs, query strings, IDs, bodies, emails,
credentials, and report contents are never labels. `/health` and `/metrics` are
excluded because probe and scrape traffic is not user-facing workload.

## Recording rules

Rules are in `../prometheus/rules/alerts.yaml` under `fixguard-slo.yml`:

- `fixguard:sli:availability:ratio`
- `fixguard:slo:availability:target`
- `fixguard:error_budget:availability:remaining_ratio`
- `fixguard:sli:http_request_rate:per_second`
- `fixguard:sli:http_5xx_rate:per_second`
- `fixguard:sli:http_success:ratio`
- `fixguard:slo:http_success:target`
- `fixguard:error_budget:http_success:remaining_ratio`
- `fixguard:sli:http_latency_p50:seconds`
- `fixguard:sli:http_latency_p95:seconds`
- `fixguard:sli:http_latency_p99:seconds`

The availability rule is an instantaneous replica-availability indicator. A
long-term production compliance report would need durable historical retention
and an explicit observation period. HTTP ratios are absent when there is no
traffic; the dashboard does not misleadingly turn “no data” into 100% success.

## Error budgets

A 99.9% availability SLO has a 0.1% error budget. In a 30-day month that is
43 minutes 12 seconds of mathematically allowed unavailability. This is not a
measurement of FixGuard downtime.

A 99.5% HTTP success SLO has a 0.5% request-based error budget: no more than 0.5%
of relevant requests may produce 5xx responses before the budget is exhausted.
Expected 4xx client responses are not service failures.

Remaining-budget recordings normalize the observed failure ratio against the
target budget and clamp the result to 0-100%. Multi-window burn-rate alerting is
deliberately deferred until production traffic and retention make it meaningful.

## RabbitMQ reliability

The dashboard tracks per-queue depth, DLQ depth, and consumers. The objective is
zero DLQ messages during normal operation, with consumers present and ordinary
queues draining without sustained backlog. Broker metrics do not prove end-to-end,
exactly-once, or loss-free delivery. That requires message IDs, tracing, idempotent
consumers, and/or transactional outbox guarantees.

## Architecture

```text
Users -> FixGuard APIs -> Business Logic
              |
              +-- HTTP metrics --> Prometheus --> Grafana SLO dashboard

RabbitMQ ------------------------> Prometheus
Kubernetes ----------------------> Prometheus
Prometheus ----------------------> Alertmanager
FixGuard logs -------------------> Alloy -> Loki -> Grafana
```

Prometheus remains the metrics and alerting authority. Loki complements it with
logs. No monitoring endpoint is exposed through public Ingress.

## Useful PromQL

```promql
sum(rate(fixguard_http_requests_total[5m]))
sum(rate(fixguard_http_requests_total{status_code!~"5.."}[5m])) / sum(rate(fixguard_http_requests_total[5m]))
sum(rate(fixguard_http_requests_total{status_code=~"5.."}[5m]))
histogram_quantile(0.50, sum by (le) (rate(fixguard_http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.95, sum by (le) (rate(fixguard_http_request_duration_seconds_bucket[5m])))
histogram_quantile(0.99, sum by (le) (rate(fixguard_http_request_duration_seconds_bucket[5m])))
fixguard:sli:availability:ratio
rabbitmq_queue_messages{job="rabbitmq-per-object"}
rabbitmq_queue_messages{job="rabbitmq-per-object",queue=~".*\\.dlq$"}
```

Phase 10.6 controlled failure and recovery testing remains deferred. Do not scale
services to zero, kill dependencies, overload queues, fill DLQs, crash containers,
or delete pods as part of Phase 10.5.
