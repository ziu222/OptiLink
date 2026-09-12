# Workspace polish → EC2 delivery

## Scope

Use the Shorten Link workspace tokens for QR Studio, Bio Page editing controls,
sidebar and Profile. Keep the published Bio Page's chosen palette separate.
Deploy the actual Vite frontend and Express API, not the local QA fixtures.

Each step is one Conventional Commit. Finish each stage with a Conventional
Commit-style PR title, verification, then merge. Do not include unrelated tree
assets or work-in-progress changes in these PRs.

## Stage 1 — Consistent workspace controls

PR: `feat(workspace): unify editor theme and loading states`

1. `feat(ui): add themed select and dual-ring loading controls`
   - Portal dropdown, keyboard navigation, focus, disabled choices, typeahead.
   - Accessible nested loading rings with reduced-motion support.
2. `style(workspace): align qr bio and profile controls`
   - Neutral workspace surfaces, borders and buttons; preserve Bio preview colors.
   - Replace native Bio design/library dropdowns, simplify option names.
   - Apply loaders to route loading, QR generation, publishing and avatar upload.
   - Preserve an existing avatar when upload fails and avoid stale Bio updates.

Gate: client/server builds, frontend lint and tests, browser checks for desktop
and mobile dropdowns, keyboard selection, light/dark theme and loading states.
QR payload generation must remain unchanged.

## Stage 2 — CI quality gate

PR: `ci: validate frontend and backend before delivery`

1. `ci: add pull request build lint and test checks`
   - Run on PRs and main; install from lockfiles with a supported Node LTS.
   - Frontend lint, Vitest, production build; backend TypeScript build.
   - Add concurrency cancellation for obsolete PR runs and read-only permissions.
2. `ci: validate production container builds`
   - Build both container images and validate production Compose configuration.
   - Add smoke checks for API readiness and SPA routes.
   - Require all checks before any deployment job; never expose secrets to fork PRs.

Gate: a clean checkout passes CI. Review required branch checks. The current
workflow deploys only the backend on main and has no preceding test/build job;
replace that workflow as part of this stage, not by adding a competing deploy job.

## Stage 3 — Production packaging and EC2 setup

PR: `feat(infra): package optilink for ec2`

1. `build: add production frontend container`
   - Multi-stage Vite build; serve dist with SPA fallback and hashed asset caching.
   - Set VITE_API_URL during build; exclude .env files, local QA fixtures and secrets.
2. `feat(infra): add https proxy and persistent services`
   - Confirm domains and select HTTPS reverse proxy. HTTPS is required for WebGPU
     outside localhost and for production secure auth cookies.
   - Route app/API correctly, including short-link redirects, uploads and auth.
   - Configure FRONTEND_URL, BASE_URL and independent access/refresh token secrets.
   - Keep MongoDB and Redis private; expose only proxy ports 80/443.
   - Add health checks and persist avatars, database, Redis and TLS state.
   - Preserve existing `mongo_data_prod`/`redis_data_prod` volumes and Compose
     project identity. Back up existing uploads before adding an upload volume.
3. `docs(infra): document ec2 bootstrap backup and restore`
   - Record region, OS, CPU architecture, instance sizing and deployment directory.
   - Restrict SSH source or use SSM; set least-privilege deployment access.
   - Document DNS, encrypted storage, log rotation, backups and a restore drill.

Gate: verify on the agreed target or staging host; restart containers without
losing an avatar or saved link. No instance creation or paid resource provisioning
until the target and cost constraints are confirmed.

## Stage 4 — Release and rollback

PR: `ci(deploy): release verified builds to ec2`

1. `ci(deploy): publish immutable release images`
   - Tag images by tested commit SHA and retain a previous known-good release.
   - Use a GitHub production environment with required approval for first rollout.
   - Pin third-party actions; use least privilege and verified SSH host identity
     or an approved OIDC/SSM setup. Keep credentials out of repository and logs.
2. `feat(deploy): add health-gated rollout and rollback`
   - Deploy the exact tested release, serialize deployments and use bounded waits.
   - On failed readiness, restore previous application images; never delete data
     volumes or roll back a database without an explicit migration/restore plan.
3. `test(deploy): verify production link bio and qr journeys`
   - HTTPS login and refresh-cookie round trip.
   - Create/list a short link; open the redirect and verify tracking.
   - Upload an avatar; publish a Bio Page and verify its block's saved short link.
   - Generate/download/decode QR; load WebGPU tree and switch to 2D on HTTPS.
   - Rehearse failed health check and rollback before enabling automatic deploy.

Gate: record release SHA, production URLs, checks and rollback SHA. A merged PR
alone is not evidence of a successful deployment.

## Required deployment inputs

- Existing EC2 instance or permission and budget for a new one; AWS region and OS.
- App/API domains, DNS access, existing data/volumes and backup location.
- SSH or SSM access method and GitHub production environment configuration.

Provide credential identifiers/configuration only; do not paste private keys or
AWS secrets into chat. Until these are confirmed, infrastructure stages remain
planned and production deployment is not performed.
