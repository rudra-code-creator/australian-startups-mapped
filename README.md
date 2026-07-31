## Australian Startup Map

An Australian startup office map covering Brisbane, Sydney, Melbourne, Adelaide, and Perth. The app is **map‑first**, with hub markers that expand into logo bubbles and a right‑hand detail panel for each startup.

### Overview

- **Tech stack**: Next.js App Router, TypeScript, React, Leaflet, Tailwind CSS, Prisma + SQLite.
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

- **Node.js**: 18.x or newer (matching Next.js 14 requirements).
- **Package manager**: npm (uses `package-lock.json`).

### Environment variables

Create a `.env` file in the project root (or copy from `.env.example`) and set:

- **`DATABASE_URL`**: SQLite connection string, e.g. `file:./dev.db`.
  - Defaults to `file:./dev.db` in development if not set.
  - Controls where Prisma stores suggestions and approval state.
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

