# FixGuard Kubernetes deployment

This directory contains the Phase 9 Kubernetes configuration for the `fixguard` namespace:

- namespace, non-sensitive application configuration, and safe Secret guidance;
- PostgreSQL and RabbitMQ StatefulSets with persistent storage;
- explicit service-owned Prisma migration and seed Jobs;
- Auth, Location, Report, Assignment, Notification, and Analytics Deployments and ClusterIP Services;
- the immutable frontend Deployment and ClusterIP Service;
- ingress-nginx routing for `http://fixguard.local`.

Application images use immutable GHCR tags and `ghcr-pull-secret`. Runtime credentials remain in the Kubernetes Secret and are not committed. Backend databases are service-owned, internal endpoints are not exposed through Ingress, and PostgreSQL and RabbitMQ remain cluster-internal.

## Client-side validation

From the repository root:

```powershell
kubectl apply --dry-run=client -f infrastructure/kubernetes/namespace.yaml
kubectl apply --dry-run=client -f infrastructure/kubernetes/config/app-config.yaml
kubectl apply --dry-run=client -f infrastructure/kubernetes/secrets/fixguard-secrets.example.yaml
kubectl apply --dry-run=client -f infrastructure/kubernetes/frontend/
kubectl apply --dry-run=client -f infrastructure/kubernetes/ingress/
```

Do not apply the example Secret as a real runtime Secret. It intentionally contains non-working placeholders and uses the name `fixguard-secrets-example`.

Apply component directories only after their image tags and required runtime Secret/configuration have been verified. The local hostname must resolve `fixguard.local` to `127.0.0.1` for host-side access. Ingress does not expose service-internal endpoints.
