# Loki manifests folder

This directory contains standalone Kubernetes manifests for Grafana Loki `v3.4.3`
running in single-binary (monolithic) mode — appropriate for local Docker Desktop
development with a single node.

## Files

- `loki-configmap.yaml` — Loki configuration (`loki.yaml`) embedded in a ConfigMap.
  Configures: filesystem storage, TSDB schema v13, 7-day retention via compactor,
  inmemory ring kvstore (single-node safe).
- `deployment.yaml` — 3 Gi PVC and Loki Deployment. Uses `Recreate` rollout strategy
  because the single-writer filesystem backend does not allow two concurrent Loki instances
  to share the same index files.
- `service.yaml` — Internal `ClusterIP` on ports 3100 (HTTP) and 9096 (gRPC). Never
  exposed via Ingress.

## Local access

```bash
kubectl -n monitoring port-forward service/loki 3100:3100
```

### Health check
```bash
curl http://localhost:3100/ready
# → ready
```

### Label inspection
```bash
# All labels Loki has seen (wait ~60s after Alloy starts)
curl http://localhost:3100/loki/api/v1/labels

# All streams from the fixguard namespace
curl 'http://localhost:3100/loki/api/v1/series?match[]={namespace="fixguard"}'
```

### LogQL spot checks
```bash
# All fixguard logs (last 100 lines)
curl -G http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={namespace="fixguard"}' \
  --data-urlencode 'limit=100'

# Auth service only
curl -G http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={namespace="fixguard", app="auth-service"}'

# Errors
curl -G http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={namespace="fixguard"} |= "error"'
```

## Architecture decision

- **Single-binary mode** (`-target=all`): All Loki components (ingester, querier, ruler,
  compactor) run in a single process. Sufficient for development log volumes.
- **Filesystem backend**: Stores chunks and index on the local PVC. Not suitable for
  production (no redundancy); use object storage (S3/GCS) for production.
- **7-day retention**: Controlled by `limits_config.retention_period: 168h` and enforced
  by the compactor.
