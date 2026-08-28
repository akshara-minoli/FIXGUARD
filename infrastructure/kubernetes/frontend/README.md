# FixGuard frontend on Kubernetes

The frontend is served by Nginx on port 80. Its Vite bundle was built with
`http://fixguard.local` as the base for all six service clients; each client appends
its complete `/api/...` path, matching the planned same-host Ingress routes. Vite
configuration is public and compiled into the bundle; Kubernetes environment
variables cannot change these URLs at runtime.

The upstream Nginx image has no Docker `USER`. Audit testing confirmed that forcing
UID/GID 101 fails because the root-owned Nginx cache directories cannot be created.
The container therefore retains the required root master process, which drops to
UID/GID 101 for workers. Privilege escalation is disabled, RuntimeDefault seccomp is
used, all default capabilities are dropped, and only the five capabilities proven
necessary during startup are restored: `CHOWN`, `DAC_OVERRIDE`, `SETGID`, `SETUID`,
and `NET_BIND_SERVICE`.

The Service is internal-only (`ClusterIP`). Ingress is intentionally not included.
