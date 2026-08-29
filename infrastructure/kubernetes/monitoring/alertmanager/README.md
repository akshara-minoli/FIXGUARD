# Alertmanager

Alertmanager `v0.33.1` runs as one internal-only replica. The `local-ui` receiver
has no external integration, so alerts can be grouped, silenced, and inspected
without storing notification credentials.

```bash
kubectl apply -f infrastructure/kubernetes/monitoring/alertmanager/
kubectl -n monitoring port-forward service/alertmanager 9093:9093
```

Open <http://localhost:9093>. The service is `ClusterIP`; no Ingress is provided.

Routing groups alerts by `alertname`, `namespace`, and `service`, waits 15 seconds
for an initial group, sends group updates no more often than every 2 minutes, and
repeats unresolved groups every 4 hours.
