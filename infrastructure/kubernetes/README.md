# FixGuard Kubernetes foundation

This directory contains the Kubernetes configuration for the `fixguard` namespace. The current foundation defines only:

- the namespace;
- non-sensitive application configuration;
- a safe Secret template and secret-handling guidance.

PostgreSQL and RabbitMQ are defined under `postgres/` and `rabbitmq/`. Explicit service-owned Prisma migration Jobs are defined under `migrations/`. Application workloads, seeds, and ingress will be added only in approved later steps.

## Client-side validation

From the repository root:

```powershell
kubectl apply --dry-run=client -f infrastructure/kubernetes/namespace.yaml
kubectl apply --dry-run=client -f infrastructure/kubernetes/config/app-config.yaml
kubectl apply --dry-run=client -f infrastructure/kubernetes/secrets/fixguard-secrets.example.yaml
```

Do not apply the example Secret as a real runtime Secret. It intentionally contains non-working placeholders and uses the name `fixguard-secrets-example`.
