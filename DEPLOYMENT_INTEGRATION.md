# Deployment & Integration Runbook

Platforms: **GitHub** (source of truth) · **Railway** (primary host — LIVE) · **Vercel** (mirror host — LIVE) · **Supabase** (managed Postgres — one access token away).

## 0. Current live state (2026-08-22) — ALL PLATFORMS WIRED

| Host | URL | Status |
|---|---|---|
| Railway | https://english-wizard-production.up.railway.app | LIVE, full stack incl. DB |
| Vercel | https://english-wizard.vercel.app | LIVE, full stack incl. DB |
| GitHub | `mahmoudhamouda1987/english-wizard` @ `main` | pushed, current |

## 1. GitHub — DONE

- Repo: `mahmoudhamouda1987/english-wizard` (branch `main`).
- Gates run before every push: typecheck, lint, unit, build, E2E.
- `.env` gitignored; also excluded from deploy images via `.railwayignore`.

## 2. Railway — primary host (LIVE)

Config in repo: `railway.toml` (Nixpacks, startCommand `npm run start`, healthcheck `/api/health`), `scripts/start.mjs` applies schema idempotently on boot.

Live deployment facts:

- Project `stellar-integrity` → service `English-Wizard` + private Postgres.
- Production fixes that made deploys green: bind `0.0.0.0` (`BIND_HOST` override), build-time schema gate degrades when builders hide secrets.
- Deploy updates: `railway up --service English-Wizard` from this directory.
- The service's `DATABASE_URL` uses the internal hostname — reachable only inside Railway (by design).

Auto-deploy from GitHub: Dashboard → Service → Settings → Source → Connect repo `english-wizard` (one click). After that every push to `main` redeploys.

## 3. Supabase — DONE (shared database for both hosts)

- Project english-wizard (ref xgwanwsdfplafecipbqv, eu-central-1) created via CLI.
- Schema applied through the Supavisor pooler (port 6543, pgbouncer) — 22 public tables verified.
- Both hosts use the SAME pooled URL; SSL enforced automatically by src/infrastructure/database.ts.
- Local development intentionally keeps the embedded PostgreSQL (port 5433) so test runs never touch production data.

## 4. Vercel — mirror host (LIVE)

- Project `english-wizard`, framework auto-detected Next.js (zero-config; do NOT add multi-service `vercel.json`).
- Env vars set: `DATABASE_URL` (currently Railway-internal placeholder until Supabase swap), `OPENAI_API_KEY`.
- Build command applies schema when the builder can reach the DB, degrades gracefully otherwise.
- Redeploy after env changes: `vercel --prod`.

## 5. Required environment variables

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Railway/Vercel | Postgres connection string |
| `OPENAI_API_KEY` | Railway/Vercel | enables AI teacher; controlled 502s without it |
| `ADMIN_EMAILS` | optional | allowlist for admin/review APIs |
| `DATABASE_SSL` | optional | force TLS on/off (auto otherwise) |

## 6. Verification checklist after any deploy

1. `GET /api/health` → `{"status":"ok"}`
2. Register a learner → learner-state assigned (DB reachable end-to-end).
3. `/api/metrics` returns 401 unauthenticated / aggregates authenticated.
4. AI lesson generation works once provider credits exist.
