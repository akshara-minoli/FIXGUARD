# Notification service on Kubernetes

The Deployment overrides the immutable image's migration-running command with
`npm start`. Prisma migrations remain managed by the separate migration Job.

The service consumes `report.#` and `assignment.#` from the durable
`notification-service.events` queue on the durable `fixguard.events` topic exchange.
Failed messages are retried twice using the `x-retry` header, then copied to
`notification-service.dlq`. Successful event processing atomically records the event
UUID and any resulting notification; duplicate UUIDs are acknowledged without
creating duplicate notifications.
