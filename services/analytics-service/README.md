# FixGuard Analytics Service

Stores aggregate operational snapshots only. Source data is collected from protected internal REST APIs; this service never connects to another service's database.

Average resolution hours use Assignment `assignedAt` to `completedAt`. Report trend resolution dates use the latest `updatedAt` timestamp for reports currently in `RESOLVED` status because Report Service does not yet own a dedicated `resolvedAt` field.

Admin endpoints include summary, report status/category/priority breakdowns, locations, hotspots, assignments, teams, and validated 7/30/90-day trends under `/api/admin/analytics`.
