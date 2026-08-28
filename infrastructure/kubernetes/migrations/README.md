# FixGuard Prisma migration Jobs

These explicit deployment-time Jobs run only committed Prisma migrations through each service's production script:

```text
npm run prisma:migrate:deploy
→ prisma migrate deploy
```

They do not start an application server, run development migrations, use `db push`, or seed data.

## Images and database ownership

| Job | Immutable image | Secret database key | Migration history |
|---|---|---|---|
| Auth | `fixguard-auth:08ed08f3f4b4` | `AUTH_DATABASE_URL` | init auth; username; profile fields |
| Location | `fixguard-location:08ed08f3f4b4` | `LOCATION_DATABASE_URL` | init location |
| Report | `fixguard-report:08ed08f3f4b4` | `REPORT_DATABASE_URL` | init report; location references |
| Assignment | `fixguard-assignment:8610ef5fc898` | `ASSIGNMENT_DATABASE_URL` | init assignment |
| Notification | `fixguard-notification:8610ef5fc898` | `NOTIFICATION_DATABASE_URL` | init notification; processed events |
| Analytics | `fixguard-analytics:8610ef5fc898` | `ANALYTICS_DATABASE_URL` | init analytics; processed events |

Every Job reads exactly one service-specific URL and cannot obtain another service's database URL from its environment.

## Execution order

Run sequentially: Auth, Location, Report, Assignment, Notification, Analytics. Wait for each Job to complete and inspect its logs before starting the next.

The private GHCR images require `ghcr-pull-secret` in the `fixguard` namespace. Create that Secret directly in Kubernetes; never commit its Docker credentials.

## Future release reruns

A completed fixed-name Job cannot be patched with a new image or pod template. For a later release:

1. update the manifest to the newly verified immutable image tag;
2. delete only the completed migration Job object, never a database or PVC;
3. apply that one Job manifest;
4. wait for completion and inspect logs.

`prisma migrate deploy` uses `_prisma_migrations` and safely applies only migrations not already recorded. Migration Jobs are independent of Deployment restarts and are never embedded as application init containers.

