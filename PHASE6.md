# FixGuard Phase 6 Messaging

FixGuard uses REST for synchronous commands and queries (location validation, report validation, assignment-to-report state synchronization, CRUD, and analytics reconciliation). RabbitMQ carries asynchronous domain events used by Notification and Analytics.

The durable topic exchange is `fixguard.events`. Report Service publishes `report.created`, `report.status.changed`, and `report.priority.changed`. Assignment Service publishes `assignment.created` and `assignment.status.changed` after synchronous report synchronization succeeds.

Notification Service owns `notification-service.events` and `notification-service.dlq`. Analytics Service independently owns `analytics-service.events` and `analytics-service.dlq`. Both bind `report.#` and `assignment.#`, manually acknowledge messages, validate version-1 envelopes, retry twice within their own queue, and dead-letter persistent failures. Each records `eventId` in its own `processed_events` table for idempotency.

The Management UI is available at `http://localhost:15672`; credentials come from the ignored root `.env`. Event publication is a degraded dependency: primary writes remain available during broker outages, but a failed publication is logged and can be lost because Phase 6 intentionally does not implement a transactional outbox.
