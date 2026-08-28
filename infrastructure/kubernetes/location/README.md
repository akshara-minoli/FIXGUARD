# Location service on Kubernetes

The Deployment runs the immutable Location image with `npm start`, overriding the
image's `start:container` command so migrations and reference-data seeding never run
during ordinary pod startup. Prisma migrations are managed separately in
`../migrations/`.

Runtime configuration comes from `fixguard-app-config`; `LOCATION_DATABASE_URL` is
mapped to `DATABASE_URL`, while `JWT_SECRET` and `INTERNAL_SERVICE_KEY` come from
`fixguard-secrets`.

After the Deployment is healthy, run `location-seed-job.yaml` once when reference
data is required. The repository seed uses unique-key Prisma upserts for districts,
areas, and service zones, making repeat execution idempotent.
