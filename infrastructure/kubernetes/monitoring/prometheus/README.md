# Prometheus manifests folder

This directory contains standalone Kubernetes manifests for Prometheus server and exporters:

- `clusterrole.yaml`: ServiceAccount, ClusterRole, and ClusterRoleBinding for API discovery.
- `configmap.yaml`: `prometheus.yml` scrape configuration mapping.
- `deployment.yaml`: PVC storage definition and Prometheus server pod.
- `service.yaml`: Internal ClusterIP port 9090.
- `node-exporter.yaml`: DaemonSet for node-level system metrics.
- `kube-state-metrics.yaml`: Metrics collection from Kubernetes API objects.
- `postgres-exporter.yaml`: PostgreSQL sidecar-style metrics exporter.
- `rules/alerts.yaml`: FixGuard workload, dependency, and monitoring alert rules.

Prometheus sends alerts to the internal `alertmanager.monitoring.svc:9093`
service. Validate the mounted configuration with:

```bash
kubectl -n monitoring exec deployment/prometheus -- promtool check config /etc/prometheus/prometheus.yml
```
