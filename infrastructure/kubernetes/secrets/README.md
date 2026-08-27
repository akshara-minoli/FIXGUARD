# Kubernetes secrets

`fixguard-secrets.example.yaml` is documentation only. It contains placeholders and must never contain working credentials.

For local deployment, copy the example to `fixguard-secrets.local.yaml`, replace every placeholder, change the Secret name to `fixguard-secrets`, and keep the local file untracked. Prefer creating the real Secret directly from a secure local source instead of saving plaintext credentials to disk.

The six raw database-password keys initialize PostgreSQL roles. Their corresponding `*_DATABASE_URL` values must contain the same passwords in URL-encoded form when reserved URL characters are used.

GHCR access must be created directly in the cluster and must not be added to this repository:

```powershell
kubectl -n fixguard create secret docker-registry ghcr-pull-secret `
  --docker-server=ghcr.io `
  --docker-username=<github-username> `
  --docker-password=<github-token>
```

Use a token with only the package-read permissions required for image pulling. Do not place the command with a real token in shell history, logs, documentation, manifests, ConfigMaps, or Vite variables.
