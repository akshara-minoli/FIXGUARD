# Analytics service on Kubernetes

The Deployment overrides the immutable image's migration-running command with
`npm start`. Prisma migrations remain managed by the separate migration Job.

The service consumes `report.#` and `assignment.#` from the durable
`analytics-service.events` queue on the durable `fixguard.events` topic exchange.
Failed messages are retried twice using the `x-retry` header, then copied to
`analytics-service.dlq`. Event UUIDs are recorded in `processed_events`, so repeated
delivery is acknowledged as a duplicate.

Authenticated analytics refresh endpoints call the protected Report, Assignment,
and Location internal APIs using `INTERNAL_SERVICE_KEY`, then persist aggregate-only
rows in `analytics_snapshots`; the service never reads another service's database.
