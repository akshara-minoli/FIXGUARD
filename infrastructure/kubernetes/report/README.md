# Report service on Kubernetes

The Deployment runs the immutable Report image with `npm start`, overriding the
image's `start:container` command so Prisma migrations never run during ordinary
pod startup. Migrations remain managed by `../migrations/report-migration-job.yaml`.

`fixguard-app-config` supplies the port, browser origin, Location Service URL, and
RabbitMQ exchange. `fixguard-secrets` supplies the Report database URL, JWT signing
secret, internal service key, and RabbitMQ URL.

The application connects to PostgreSQL at startup. RabbitMQ is connected lazily on
the first event publication, when the application creates a confirm channel and
idempotently asserts the durable `fixguard.events` topic exchange. A closed or failed
connection is cleared so a later publication can reconnect; a failed individual
publication is logged and returns `false` without an in-request retry.
