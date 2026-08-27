# FixGuard Report Service

Owns infrastructure reports in `fixguard_report`. It accepts identity from a
verified JWT and never queries the Auth Service database.

Local port: `4002`. Health endpoint: `GET /health`.
