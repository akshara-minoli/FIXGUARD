# Assignment service on Kubernetes

The Deployment runs the immutable Assignment image with `npm start`, overriding
the image's `start:container` command so Prisma migrations never run during normal
pod startup. Migrations remain managed by
`../migrations/assignment-migration-job.yaml`.

`fixguard-app-config` supplies the port, browser origin, Report and Location service
URLs, and RabbitMQ exchange. `fixguard-secrets` supplies the Assignment database URL,
JWT signing secret, internal service key, and RabbitMQ URL.

Maintenance teams are managed through the authenticated admin API. The repository
has no seed script, so the Deployment does not create teams and no seed Job is
provided. Team creation validates the selected service zone against Location.

Assignment creation verifies that the Report is `VERIFIED`, creates the Assignment
row, synchronizes the Report to `ASSIGNED`, and publishes through a RabbitMQ confirm
channel. The durable `fixguard.events` topic exchange is asserted idempotently on
the first publication.
