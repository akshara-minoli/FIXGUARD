# Jenkins CI/CD operations

## Jobs

Create a Jenkins folder named `FixGuard` and normal Pipeline jobs with **Pipeline script from SCM**:

| Job | Script path | Recommended include region |
|---|---|---|
| Auth CI | `services/auth-service/Jenkinsfile` | `services/auth-service/.*` |
| Report CI | `services/report-service/Jenkinsfile` | `services/report-service/.*` |
| Location CI | `services/location-service/Jenkinsfile` | `services/location-service/.*` |
| Assignment CI | `services/assignment-service/Jenkinsfile` | `services/assignment-service/.*` |
| Notification CI | `services/notification-service/Jenkinsfile` | `services/notification-service/.*` |
| Analytics CI | `services/analytics-service/Jenkinsfile` | `services/analytics-service/.*` |
| Frontend CI | `frontend/Jenkinsfile` | `frontend/.*` |
| Full Build | `Jenkinsfile` | Run manually or for release branches |

Use repository `https://github.com/akshara-minoli/FIXGUARD.git`. For a localhost-only Jenkins installation, prefer **Build Now** or a conservative Poll SCM schedule. Do not expose Jenkins directly to the internet merely to receive GitHub webhooks.

## Required capabilities

The Jenkins controller/agent needs Git and a working Docker CLI/engine connection. Node.js and Trivy run in pinned containers, avoiding controller-wide tool installations. The Docker Pipeline, Pipeline, Git, Credentials, and Credentials Binding plugins are required.

The existing Docker-based Jenkins installation is configured for a TLS-enabled Docker sidecar at `tcp://docker:2376`. Both containers must share:

- the `jenkins` Docker network, with the sidecar alias `docker`;
- `jenkins-docker-certs:/certs/client` for client TLS certificates;
- `jenkins-data:/var/jenkins_home` so bind-mounted workspaces are visible to the sidecar engine.

> [!NOTE]
> While Jenkins communicates with the Docker daemon via TCP TLS on port 2376, mounting `/var/run/docker.sock` in containerized pipeline steps (e.g., Trivy scans) is fully compatible. The Docker daemon inside the `jenkins-docker` container resolves `/var/run/docker.sock` internally where the socket genuinely exists, allowing Trivy to query the local image cache successfully.

Granting Jenkins access to a Docker engine is security-sensitive: a pipeline that can control the engine is effectively highly privileged. Limit job configuration and repository write access to trusted users, protect credentials, and never run untrusted pull-request code with registry credentials.

## GHCR credentials

Create one Jenkins **Username with password** credential:

- ID: `ghcr-credentials`
- Username: GitHub username
- Password: GitHub token with the minimum package permissions required (`write:packages`; add `read:packages` if private dependencies/images require it)

The token is injected only during the main-branch push stage and is passed to `docker login` through standard input. Do not store it in parameters, source control, Vite variables, Docker build arguments, or images.

## Images and branch behavior

Pipelines produce:

```text
ghcr.io/akshara-minoli/fixguard-auth:<commit-sha>
ghcr.io/akshara-minoli/fixguard-report:<commit-sha>
ghcr.io/akshara-minoli/fixguard-location:<commit-sha>
ghcr.io/akshara-minoli/fixguard-assignment:<commit-sha>
ghcr.io/akshara-minoli/fixguard-notification:<commit-sha>
ghcr.io/akshara-minoli/fixguard-analytics:<commit-sha>
ghcr.io/akshara-minoli/fixguard-frontend:<commit-sha>
```

The immutable tag is the first 12 characters of the checked-out commit. A successful `main` build pushes both the immutable tag and `latest`. Feature branches and pull requests stop after build and scan.

## Security gates

Trivy reports `HIGH` and `CRITICAL` findings. Unfixed `CRITICAL` findings return non-zero and stop the pipeline before registry login/push; `HIGH` findings are initially informational. Tighten this policy after dependency and base-image remediation. `npm audit` is also informational and never runs an automatic fix.

Docker build contexts exclude `.env*`, Git metadata, `node_modules`, coverage, logs, and IDE data. Prisma schemas remain included. A post-build check confirms expected secret-bearing paths are absent from the image.

## Validation procedure

1. Run each job independently and confirm checkout, `npm ci`, Prisma generation (backend), tests, Docker build, Trivy, and GHCR push.
2. Confirm the immutable package tag in GHCR and `latest` after a `main` build.
3. On a temporary branch, deliberately make one test fail. Confirm Docker Build, Trivy, and Push are skipped, then revert the failure before merging.
4. Build two distinct commits and confirm both SHA tags remain in GHCR.
5. Run **Full Build** and confirm the seven parallel branches pass. Enable `RUN_COMPOSE_VALIDATION` only with an isolated CI environment file/credentials; it must never use the normal development databases.

The pipelines never run `prisma migrate reset`, Docker system/volume prune, Kubernetes deployment, or any production database mutation.
