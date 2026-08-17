## Australian Startup Map

An Australian startup office map covering Brisbane, Sydney, Melbourne, Adelaide, and Perth. The app is **map‑first**, with hub markers that expand into logo bubbles and a right‑hand detail panel for each startup.

### Overview

- **Tech stack**: Next.js 16 App Router, TypeScript, React 19, Leaflet, Tailwind CSS, Prisma + SQLite (LibSQL adapter).
- **Main surfaces**: `/` (home), `/maps/[city]`, `/suggest` (public suggest form), `/admin` (password‑protected approval queue).
- **Data model**: Curated seed JSON in the repo plus a small SQLite database for suggestions and approval state.

### Seed data and disclosure

- **Curated / illustrative only**: The built‑in seed data is a hand‑picked, **illustrative** snapshot of notable startups and hubs, **not** an official or exhaustive census.
- **Where it lives**:
  - `src/data/startups/*.json` — curated startup seed data per city.
  - `src/data/buildings.json` — shared building / hub metadata.
- **Runtime behaviour**:
  - Curated seed is always loaded for each city.
  - New suggestions are stored in the database and only appear on the live maps once an admin approves them.

### Cities

The map ships with five Australian city maps:

- **Brisbane** (`/maps/brisbane`)
- **Sydney** (`/maps/sydney`)
- **Melbourne** (`/maps/melbourne`)
- **Adelaide** (`/maps/adelaide`)
- **Perth** (`/maps/perth`)

### Prerequisites

- **Node.js**: **20.9+** (Next.js 16 requirement). Use one Node version consistently for install and `npm run dev` (fnm/nvm recommended).
- **Package manager**: npm (uses `package-lock.json`).

### Environment variables

Create a `.env` file in the project root (or copy from `.env.example`) and set:

- **`DATABASE_URL`**: SQLite connection string, e.g. `file:./dev.db`.
  - Defaults to `file:./dev.db` in development if not set.
  - Controls where Prisma stores suggestions and approval state.
- **`ADMIN_USERNAME`**: Username for `/admin` (defaults to `ADMIN` if unset).
- **`ADMIN_PASSWORD`**: Password for the `/admin` approval UI.
  - Required to log in and approve / reject suggestions.
- **`SESSION_SECRET`**: A **32+ character** random string used to encrypt admin sessions.
  - Required in all environments; the app will throw if missing.

Example:

```bash
cp .env.example .env
# then edit .env to choose ADMIN_PASSWORD and SESSION_SECRET
```

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision the database schema**

   ```bash
   npm run db:push
   ```

   This creates or updates the SQLite database defined by `DATABASE_URL`.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

### Scripts

- **`npm run dev`**: Start the Next.js dev server.
- **`npm run build`**: Build the production bundle.
- **`npm run start`**: Start the production server (after `npm run build`).
- **`npm run lint`**: Run ESLint via `next lint`.
- **`npm run test`**: Run the Vitest suite, including smoke tests.
- **`npm run test:watch`**: Run tests in watch mode.
- **`npm run db:push`**: Push the Prisma schema to the configured database.
- **`npm run db:studio`**: Open Prisma Studio to inspect and edit DB content.

### Key flows

- **Public suggest → approve / reject**
  - Visitors submit startups via `/suggest`.
  - Items land in the password‑protected `/admin` queue.
  - Admins can **Approve** (merging into the live map) or **Reject** (kept out of the public map).
- **Broken logos**
  - Startup logo URLs are rendered where available.
  - If a logo fails to load, the UI falls back to an initials avatar so the map stays visually stable.

### Deploy on Netlify

This repo is a Next.js App Router app. Connect [Netlify](https://www.netlify.com/) to `rudra-code-creator/australian-startups-mapped` and use:

- **Build command:** `npx prisma generate && npm run build` (also set in `netlify.toml`)
- **Node:** 20+

Set these site environment variables (Site settings → Environment variables):

- `ADMIN_USERNAME` — e.g. `ADMIN`
- `ADMIN_PASSWORD` — a strong password (do not use the local example in production)
- `SESSION_SECRET` — 32+ random characters
- `DATABASE_URL` — e.g. `file:/tmp/dev.db` for an ephemeral SQLite file on the serverless runtime

The public maps load from curated JSON in the repo, so city maps work without a persistent database. Suggestions, location-correction reports, and admin approvals need a writable database; Netlify’s filesystem is not durable, so use a hosted SQLite/LibSQL (e.g. Turso) if you want those queues to persist.

