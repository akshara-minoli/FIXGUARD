# FixGuard Auth Service

Phase 2 foundation for the FixGuard authentication microservice.

## Local setup

1. Copy `.env.example` to `.env` and provide the local `fixguard` PostgreSQL password.
2. Run `npm install`.
3. Run `npm run prisma:migrate -- --name init_auth`.
4. Run `npm start`.

The health endpoint is available at `http://localhost:4001/health`.

## Development admin

Configure `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the private
`.env`, then run `npm run seed:admin`. The seed is idempotent and never logs the
password. Replace all development credentials before shared, public, or cloud
deployment.
