# Grafana Alloy

Grafana Alloy `v1.8.3` runs as a DaemonSet and collects container logs from the
`fixguard` namespace. On Docker Desktop it streams logs through the Kubernetes
API so the collector can remain non-root and does not need host filesystem mounts.

## Pipeline

```text
Kubernetes pod discovery
  -> keep namespace=fixguard
  -> keep pods scheduled on this Alloy node
  -> attach namespace, pod, container, app, component labels
  -> stream via loki.source.kubernetes
  -> push to http://loki.monitoring.svc.cluster.local:3100
```

The service code already writes to stdout/stderr with `console.log` and
`console.error`; application logging code is intentionally unchanged. Most service
logs are plain text, while object arguments are formatted by the Node.js console.

## RBAC

| Resource | Verbs | Reason |
|---|---|---|
| `pods` | get, list, watch | Discover pod/container targets and metadata |
| `namespaces` | get, list, watch | Resolve namespace metadata during discovery |
| `nodes` | get, list, watch | Keep only targets scheduled on the local DaemonSet node |
| `pods/log` | get | Open read-only container log streams through the API |

Alloy cannot read Secrets, ConfigMaps, Services, or perform any write operation.
It runs as UID/GID 473, drops all Linux capabilities, and disables privilege
escalation.

## Labels and LogQL

Labels are deliberately limited to `namespace`, `pod`, `container`, `app`, and
`component` to avoid excessive cardinality. No sensitive values become labels.

```logql
{namespace="fixguard"}
{namespace="fixguard", container="auth-service"}
{namespace="fixguard"} |= "error"
{namespace="fixguard"} |~ "(?i)rabbit"
sum by (app) (count_over_time({namespace="fixguard"}[1m]))
```

## Resources and troubleshooting

Requests: 50m CPU / 128 MiB memory per node. Limits: 100m CPU / 192 MiB.

```bash
kubectl -n monitoring get daemonset alloy
kubectl -n monitoring get pods -l app.kubernetes.io/name=alloy -o wide
kubectl -n monitoring logs daemonset/alloy --tail=100
kubectl auth can-i --as=system:serviceaccount:monitoring:alloy get pods/log --all-namespaces
kubectl -n monitoring port-forward service/alloy 12345:12345
```
