# RabbitMQ for FixGuard Kubernetes

This layer defines one persistent RabbitMQ 4.1 node for local Docker Desktop Kubernetes. It is private to the `fixguard` namespace and is not exposed through NodePort, LoadBalancer, or Ingress.

## Resources

- `Service/rabbitmq`: ClusterIP with AMQP on 5672 and the management UI on 15672.
- `PersistentVolumeClaim/rabbitmq-data`: 2 GiB, `ReadWriteOnce`, using the cluster's default StorageClass.
- `StatefulSet/rabbitmq`: one replica with health probes, resource constraints, a 60-second termination grace period, and the image's established UID/GID.

RabbitMQ data is mounted at `/var/lib/rabbitmq`, matching both the official image metadata and the existing Docker Compose configuration. The independent PVC preserves queues, messages, and broker state across pod replacement. Docker Desktop's default StorageClass has a `Delete` reclaim policy, so deleting the PVC can permanently delete the backing volume.

## Credentials and application URL

The StatefulSet reads `RABBITMQ_USERNAME` and `RABBITMQ_PASSWORD` from the untracked runtime Secret named `fixguard-secrets`. Application workloads will read the complete `RABBITMQ_URL` from the same Secret:

```text
amqp://<url-encoded-user>:<url-encoded-password>@rabbitmq:5672
```

Credentials containing URL-reserved characters must be percent-encoded in the URL while the raw values remain in the username/password keys.

## Application-owned topology

No Kubernetes topology initialization Job is needed. Existing application code declares the topology idempotently:

- durable topic exchange: `fixguard.events`;
- durable consumer queues: `notification-service.events`, `analytics-service.events`;
- durable dead-letter queues: `notification-service.dlq`, `analytics-service.dlq`;
- bindings on both consumer queues: `report.#`, `assignment.#`.

Publishers in Report and Assignment lazily declare the exchange and publish persistent messages through confirm channels. Notification and Analytics consumers declare their exchange, queue, DLQ, and bindings when connecting. Failed messages are retried twice using the `x-retry` header and then manually sent to the configured DLQ; the code does not use a broker-side dead-letter exchange policy.

Consumers retry an unavailable broker every two seconds. Publishers log and return a failed publication without failing the originating HTTP operation, so a transactional outbox remains a future reliability improvement.

## Management access

Keep port 15672 private. After the resources are applied in a later approved step, local access can be established temporarily:

```powershell
kubectl -n fixguard port-forward service/rabbitmq 15672:15672
```

Then open `http://localhost:15672` and use credentials from the local runtime Secret. Do not place credentials in this README or shell history.

These manifests are not applied automatically. Validate them with `kubectl apply --dry-run=client -f infrastructure/kubernetes/rabbitmq/`.
