# Grafana manifests folder

This directory contains standalone Kubernetes manifests for the Grafana dashboard server
provisioned automatically with a Prometheus datasource and three FixGuard dashboards.

## Local credentials

`grafana-secrets.yaml` is a local, Git-ignored manifest. Create the Secret without
committing credentials:

```bash
kubectl -n monitoring create secret generic grafana-secrets \
  --from-literal=GF_SECURITY_ADMIN_USER='<local-admin-user>' \
  --from-literal=GF_SECURITY_ADMIN_PASSWORD='<local-admin-password>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Files

- `grafana-secrets.yaml`: Kubernetes `Secret` holding admin credentials (`GF_SECURITY_ADMIN_USER`,
  `GF_SECURITY_ADMIN_PASSWORD`). Change the default password before deploying outside localhost.
- `configmap-datasource.yaml`: Auto-provisions Prometheus as the default datasource on boot.
- `configmap-dashboards.yaml`: Tells Grafana's provisioner to load JSON files from
  `/var/lib/grafana/dashboards`.
- `configmap-dashboard-json.yaml`: Embeds the three FixGuard dashboard JSON definitions.
- `deployment.yaml`: 2 Gi PVC and Grafana `v11.4.0` Deployment (non-root, all ConfigMaps mounted).
- `service.yaml`: Internal `ClusterIP` on port 3000.

## Local access

```bash
kubectl -n monitoring port-forward service/grafana 3000:3000
```

Open **http://localhost:3000** and log in with:
- **Username**: `admin`
- **Password**: `fixguard-grafana` (set in `grafana-secrets.yaml`)

The **FixGuard** folder inside Grafana contains all three pre-loaded dashboards.
