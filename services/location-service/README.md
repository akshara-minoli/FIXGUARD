# FixGuard Location Service

Owns districts, areas, and service zones in `fixguard_location`. It exposes active locations publicly and JWT-protected ADMIN management endpoints.

## Development

Copy `.env.example` to `.env`, create `fixguard_location` without resetting any existing database, then run `npm install`, `npx prisma migrate deploy`, `npm run seed`, and `npm start`.
