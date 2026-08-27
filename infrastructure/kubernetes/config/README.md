# FixGuard runtime configuration

`app-config.yaml` contains only non-sensitive values shared by the future FixGuard workloads in the `fixguard` namespace.

Service Deployments will map their component-specific port key to the application's `PORT` environment variable. Notification and Analytics Deployments will likewise map their respective queue and DLQ keys to `RABBITMQ_QUEUE` and `RABBITMQ_DLQ`.

Kubernetes Service DNS names are used for server-to-server communication. `FRONTEND_URL` is the planned external browser origin and may be changed when ingress is designed.

Passwords, connection strings, JWT signing material, internal service keys, and registry credentials do not belong in this ConfigMap.
