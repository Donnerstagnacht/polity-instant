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
