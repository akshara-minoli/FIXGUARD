# PostgreSQL for FixGuard Kubernetes

This layer uses one private PostgreSQL 18 StatefulSet for local Docker Desktop Kubernetes. Six databases and six login roles preserve logical database-per-service ownership. No application tables, Prisma migrations, or seed data are created here.

## Resources

- `Service/postgres`: namespace-only ClusterIP on TCP 5432.
- `PersistentVolumeClaim/postgres-data`: 5 GiB, `ReadWriteOnce`, using the cluster's default StorageClass.
- `StatefulSet/postgres`: one replica with readiness/liveness probes and constrained resources.
- `Job/postgres-database-init`: waits for PostgreSQL, then idempotently creates or reconciles roles, passwords, databases, ownership, and database/schema access.

The PVC is independent of the pod, so PostgreSQL data survives pod replacement. Deleting the StatefulSet does not delete this separately managed claim. Do not delete the PVC unless permanent data loss is explicitly intended.

## Ownership mapping

| Service role | Owned database |
|---|---|
| `fixguard_auth_user` | `fixguard_auth` |
| `fixguard_report_user` | `fixguard_report` |
| `fixguard_location_user` | `fixguard_location` |
| `fixguard_assignment_user` | `fixguard_assignment` |
| `fixguard_notification_user` | `fixguard_notification` |
| `fixguard_analytics_user` | `fixguard_analytics` |

Public access is revoked on every application database and on each database's `public` schema. Each application role receives access only to its owned database. The PostgreSQL administrator retains administrative access.

## DATABASE_URL design

The real URLs live only in the `fixguard-secrets` Secret. Conceptually:

```text
postgresql://fixguard_auth_user:<url-encoded-secret>@postgres:5432/fixguard_auth?schema=public
postgresql://fixguard_report_user:<url-encoded-secret>@postgres:5432/fixguard_report?schema=public
postgresql://fixguard_location_user:<url-encoded-secret>@postgres:5432/fixguard_location?schema=public
postgresql://fixguard_assignment_user:<url-encoded-secret>@postgres:5432/fixguard_assignment?schema=public
postgresql://fixguard_notification_user:<url-encoded-secret>@postgres:5432/fixguard_notification?schema=public
postgresql://fixguard_analytics_user:<url-encoded-secret>@postgres:5432/fixguard_analytics?schema=public
```

Passwords containing URL-reserved characters must be percent-encoded in `DATABASE_URL`; the corresponding raw password keys are used by the initialization Job.

The Job's SQL is safe to execute again. Because a completed Kubernetes Job with the same name is immutable, rerunning it requires deleting only that completed Job object and recreating it; this does not delete or reset PostgreSQL data.

These files are not applied automatically. Validate them from the repository root with `kubectl apply --dry-run=client -f infrastructure/kubernetes/postgres/`.
