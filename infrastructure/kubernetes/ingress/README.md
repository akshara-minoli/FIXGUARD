# FixGuard Ingress

`fixguard-ingress` exposes the browser-facing FixGuard routes at
`http://fixguard.local` through the `nginx` IngressClass. Backends already mount
their complete `/api/...` paths, so no rewrite annotation is used. ingress-nginx
orders matching Prefix paths by specificity, keeping API traffic ahead of the `/`
frontend fallback.

Only frontend-required HTTP APIs are listed. PostgreSQL, RabbitMQ, management ports,
and `/api/internal/...` handlers have no Ingress backend route. On Docker Desktop the
official ingress-nginx LoadBalancer reports `localhost`; map `fixguard.local` to
`127.0.0.1` in the Windows hosts file when local DNS does not already provide it.

The controller was installed separately from the official version-pinned ingress-nginx
v1.15.1 cloud-provider manifest for Docker Desktop. This application manifest does
not duplicate or vendor the third-party controller resources.
