# Deployment & Integration Runbook

Platforms: **GitHub** (source of truth) · **Railway** (primary host, authoritative) · **Supabase** (managed Postgres option) · **Vercel** (alternative host).

## 1. GitHub — DONE

- Repo: `mahmoudhamouda1987/english-wizard` (branch `main`).
- CI-relevant gates run locally before every push: typecheck, lint, unit, build (build now also applies the DB schema), E2E.
- `.env` is gitignored — never committed.

## 2. Railway — primary host

Config already in repo:

- `railway.toml`: Nixpacks builder, startCommand `npm run start`, healthcheck `/api/health`.
- `scripts/start.mjs` applies `db/schema.sql` idempotently on every boot.

Deployed via CLI:

```
railway init --name english-wizard
railway add --database postgres          # creates Postgres service
railway variables --set "DATABASE_URL=${{Postgres.DATABASE_URL}}"
railway variables --set "OPENAI_API_KEY=sk-..."
railway up                               # deploys current directory
railway domain                           # generate/attach public domain
```

Auto-deploy from GitHub: Dashboard → Service → Settings → Source → Connect repo `english-wizard` (one click, dashboard-only permission). After that every push to `main` redeploys.

### Switching the database to Supabase (optional)

1. Create a project at supabase.com, then copy the **Connection Pooling** string (port 6543, `pgbouncer=true`).
2. Apply schema once: `DATABASE_URL="<supabase-pool-url>" node scripts/predeploy-db.mjs`
3. Point any host at it: `railway variables --set "DATABASE_URL=<supabase-pool-url>"`
4. SSL is automatic: `src/infrastructure/database.ts` enables TLS for every non-local host (`DATABASE_SSL=false` overrides).

No other change is needed — the schema and all repositories are plain PostgreSQL.

## 3. Vercel — alternative host

The build command (`node scripts/predeploy-db.mjs && next build`) applies the schema at build time, so Vercel works without a persistent boot step:

1. Push latest `main` (done below).
2. vercel.com/new → import `english-wizard`.
3. Environment variables: `DATABASE_URL` (Supabase pooled URL recommended for serverless), `OPENAI_API_KEY`, optional `ADMIN_EMAILS`.
4. Deploy. Health check afterwards: `https://<app>.vercel.app/api/health`.

Note: prefer ONE production host against one database. Contract names Railway as authoritative; Vercel preview deployments are safe because schema apply is idempotent.

## 4. Required environment variables

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Railway/Vercel/CI | Postgres connection string |
| `OPENAI_API_KEY` | Railway/Vercel | enables AI teacher; without it AI routes return controlled 502s |
| `ADMIN_EMAILS` | optional | allowlist for `/admin/content`, review APIs |
| `DATABASE_SSL` | optional | force TLS on/off (auto otherwise) |

## 5. Verification checklist after any deploy

1. `GET /api/health` → `{"status":"ok"}`
2. Register a learner → complete diagnostic → lesson appears (schema + persistence OK).
3. `/api/metrics` returns aggregates (analytics OK).
4. AI lesson generation works (credits present).
