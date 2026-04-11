# 🏛️ Polity - Democracy Reimagined

> **Empowering communities, organizations, and governments with collaborative decision-making tools for the digital age.**

[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4%EF%B8%8F-green)](https://github.com/Donnerstagnacht/polity-instant)
[![Early Alpha](https://img.shields.io/badge/Status-Early%20Alpha-orange)](#)

---

## Prerequisites

- **Node.js 22+** (recommended via [nvm](https://github.com/nvm-sh/nvm))
- **npm**
- **Docker Desktop** (for Supabase & Zero Cache)
- **Supabase CLI** (`npm i -g supabase` or use `npx supabase`)

---

## Running the Project

## Environment Modes

This project now separates local development from production values via mode-specific env files:

- `.env.development.local` for `npm run dev` and local Supabase CLI
- `.env.production.local` for `npm run build` and local production previews against cloud services
- `.env` should stay empty or contain only shared non-sensitive defaults

### Local development mode

- App: `npm run dev`
- Supabase: local CLI stack via `npx supabase start`
- Zero: local zero-cache via `npm run zero:dev`
- Env source: `.env.development.local`

### Production mode

- Build: `npm run build`
- Preview built app locally: `npm run start`
- Supabase: cloud project
- Zero: deployed zero-cache URL
- Env source: `.env.production.local` locally, or platform env vars on Vercel/Railway

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase (local)

```bash
npx supabase start
```

This boots up a local Supabase stack (Postgres, Auth, Studio, Inbucket, etc.) via Docker.

### 3. Apply the database schema

```bash
supabase migration up
```

This creates all tables, indexes, RLS policies, storage policies, and functions from `supabase/schemas/`.

### 3b. Create storage buckets

```bash
npx supabase seed buckets
```

This provisions the `avatars` and `uploads` storage buckets defined in `supabase/config.toml`.
Buckets are **not** auto-created by `supabase start` — this step is required for image uploads to work.

### 4. Start the dev server

In a **separate terminal**:

```bash
npm run dev
```

### 5. Start Zero Cache

In a **separate terminal**:

```bash
npm run zero:dev
```

## Where to Find What

| Service               | URL                                                       | Description                                    |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| **App (Dev)**         | [http://localhost:3000](http://localhost:3000)            | Polity frontend (TanStack Start / Vinxi)       |
| **Supabase Studio**   | [http://localhost:54323](http://localhost:54323)          | Database GUI, table editor, SQL editor         |
| **Supabase API**      | [http://localhost:54321](http://localhost:54321)          | Supabase REST & Auth API                       |
| **Supabase Inbucket** | [http://localhost:54324](http://localhost:54324)          | Local email inbox (captures auth emails, OTPs) |
| **Postgres (direct)** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Direct DB connection (e.g. for psql, DBeaver)  |
| **Zero Cache**        | [http://localhost:4848](http://localhost:4848)            | Zero sync engine (realtime cache server)       |

---

## All npm Scripts

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start the dev server on port 3000              |
| `npm run build`           | Production build                               |
| `npm run start`           | Start production server                        |
| `npm run seed`            | Seed the database with test data               |
| `npm run zero:dev`        | Start zero-cache-dev with env vars (local dev) |
| `npm run zero:cache`      | Start zero-cache-dev (no env vars)             |
| `npm run supabase:start`  | Start local Supabase                           |
| `npm run supabase:stop`   | Stop local Supabase                            |
| `npm run test`            | Run unit tests (Vitest)                        |
| `npm run test:e2e`        | Run E2E tests (Playwright)                     |
| `npm run test:e2e:ui`     | Run E2E tests with Playwright UI               |
| `npm run test:e2e:headed` | Run E2E tests in headed browser                |
| `npm run lint`            | Lint with ESLint                               |
| `npm run lint:fix`        | Lint and auto-fix                              |
| `npm run format`          | Format code with Prettier                      |
| `npm run format:check`    | Check formatting                               |
| `npm run storybook`       | Start Storybook on port 6006                   |

## Deployment

The project deploys to three services:

| Service      | Target                                        | Purpose                       |
| ------------ | --------------------------------------------- | ----------------------------- |
| **Supabase** | [supabase.com](https://supabase.com/) (cloud) | Postgres database + Auth      |
| **Fly.io**   | `zero.polity.live` / `polity-zero.fly.dev`    | zero-cache (realtime sync)    |
| **Vercel**   | `www.polity.live`                             | SSR frontend (TanStack Start) |

### Deploy script

```bash
npm run deploy          # Full deploy: Supabase → Fly.io → Vercel
npm run deploy:dry      # Dry-run (prints commands without executing)
```

Skip individual steps with flags:

```bash
npm run deploy -- --skip-supabase   # Skip Supabase migrations
npm run deploy -- --skip-fly        # Skip Fly.io deploy
npm run deploy -- --skip-vercel     # Skip Vercel deploy
```

The script enforces that you are on the `master` or `deploy` branch.

### First-time setup

#### 1. Install CLIs

```bash
npm i -g supabase       # Supabase CLI
npm i -g vercel          # Vercel CLI
# Fly.io CLI: https://fly.io/docs/flyctl/install/
```

#### 2. Authenticate

```bash
supabase login
fly auth login
vercel login
```

#### 3. Link Vercel project

```bash
vercel link
```

#### 4. Create Fly.io app & volume

```bash
fly apps create polity-zero --machines
fly volumes create zero_data --region fra --size 1
fly ips allocate-v4 --shared
fly ips allocate-v6
```

#### 5. Set Fly.io secrets

```bash
fly secrets set ZERO_UPSTREAM_DB="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require"
fly secrets set ZERO_CVR_DB="postgresql://postgres.PROJECT:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
fly secrets set ZERO_CHANGE_DB="postgresql://postgres.PROJECT:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
fly secrets set ZERO_ADMIN_PASSWORD="your-strong-password"
fly secrets set ZERO_QUERY_URL="https://your-app-domain.example/api/query"
fly secrets set ZERO_MUTATE_URL="https://your-app-domain.example/api/mutate"
```

#### 6. Custom domain (optional)

Add DNS records for `zero.your-domain.example` pointing to your Fly.io IPs (A + AAAA), plus an ACME challenge CNAME for TLS:

```bash
fly certs create zero.your-domain.example
fly certs setup zero.your-domain.example   # Shows required DNS records
```

### Fly.io secrets reference

| Secret                | Value                                                                         | Notes                                                |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| `ZERO_UPSTREAM_DB`    | `postgresql://postgres:PASS@db.PROJECT.supabase.co:5432/postgres`             | **Direct** connection (required for WAL replication) |
| `ZERO_CVR_DB`         | `postgresql://postgres.PROJECT:PASS@REGION.pooler.supabase.com:5432/postgres` | **Session pooler** (supports prepared statements)    |
| `ZERO_CHANGE_DB`      | `postgresql://postgres.PROJECT:PASS@REGION.pooler.supabase.com:5432/postgres` | **Session pooler** (supports prepared statements)    |
| `ZERO_ADMIN_PASSWORD` | Any strong password                                                           | Protects zero-cache admin endpoints                  |
| `ZERO_QUERY_URL`      | `https://your-app-domain/api/query`                                           | Custom query handler on Vercel (delegates auth)      |
| `ZERO_MUTATE_URL`     | `https://your-app-domain/api/mutate`                                          | Custom mutate handler on Vercel (delegates auth)     |

> **Connection strategy:** UPSTREAM uses the direct Supabase connection (Fly.io supports outbound IPv6 natively). CVR and CHANGE use the session pooler to avoid exhausting direct connection slots on Supabase free tier.

---

## Project Structure

```
app/              # TanStack Start entry points (client, ssr, router)
src/
  routes/         # File-based route pages
  components/     # Reusable UI components (shadcn/ui)
  features/       # Feature modules (amendments, groups, events, etc.)
  hooks/          # Custom React hooks
  i18n/           # Internationalization (DE & EN)
  zero/           # Zero schema & sync setup
  utils/          # Utility functions
supabase/         # Supabase config & schema SQL
scripts/          # Database seeding scripts
e2e/              # Playwright E2E tests
```

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Vinxi)
- **Database**: [Supabase](https://supabase.com/) (Postgres) + [Zero](https://zero.rocicorp.dev/) (realtime sync)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Editor**: [Plate.js](https://platejs.org/) — Rich text collaborative editor
- **AI**: Custom AI assistants (Aria & Kai)
- **Auth**: Supabase Auth (email OTP)
- **Testing**: Vitest + Playwright
- **i18n**: i18next (German & English)

---

## Contributing

- 💻 **Code**: Fix bugs, add features, improve tests
- 🎨 **Design**: Improve UX/UI ([Figma](https://www.figma.com/proto/cAT8Aonu8P7ojwgnKcVlkz/Polity))
- 📝 **Docs**: Write guides, tutorials, API docs
- 🐛 **Testing**: Report bugs, write test cases

## Community

- **Email**: tobias.hassebrock@gmail.com

---

**⚠️ Early Alpha** — Database resets can happen. Use with caution!
