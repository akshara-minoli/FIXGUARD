# Auth service on Kubernetes

The Deployment runs the immutable Auth image with `npm start`, overriding the image's
`start:container` command so migrations and admin seeding never run during ordinary
pod startup. Prisma migrations are managed separately in `../migrations/`.

Runtime configuration comes from `fixguard-app-config`; `AUTH_DATABASE_URL` is mapped
to `DATABASE_URL`, and `JWT_SECRET` comes from `fixguard-secrets`.

After the Deployment is healthy, run `admin-seed-job.yaml` once when an initial admin
is required. The repository seed checks for the configured username and email and is
idempotent; conflicting existing identities cause the Job to fail for manual review.
