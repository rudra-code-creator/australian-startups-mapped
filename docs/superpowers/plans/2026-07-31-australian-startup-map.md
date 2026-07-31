# Australian Startup Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a map-first Next.js site that shows dense Australian startup office maps for five cities, with building-hub numbered clusters, a suggest-for-review flow, and password admin Approve/Reject.

**Architecture:** Curated startups live in versioned JSON per city. Suggestions and approvals live in SQLite via Prisma. Public map API merges seed + `approved` rows. Leaflet + Carto greyscale tiles render logo bubbles; co-location uses `buildingId` only (no zoom clustering). Admin uses an env password and a signed session cookie.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React, Leaflet + react-leaflet, Prisma + SQLite, Vitest, CSS variables (no purple default theme).

## Global Constraints

- Cities only: `brisbane` | `sydney` | `melbourne` | `adelaide` | `perth`
- Map: Leaflet + free Carto light/grey tiles — no Mapbox in v1
- Clustering: building/hub `buildingId` only — no zoom-based generic clustering
- Suggestions: `pending` until admin Approve; never show pending/rejected on public map
- Admin: password via `ADMIN_PASSWORD`; session cookie; no public user accounts
- Seed density target: ~40–60 startups per city; label UI as curated/illustrative
- Accent: deep teal or ink blue — not purple; brand-forward home, not a dashboard hero
- Logos: URL with initials fallback on error
- Approve requires `lat`/`lng` before a suggestion can go live

---

## File structure (create unless noted)

| Path | Responsibility |
| --- | --- |
| `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts` | App tooling |
| `.env.example`, `.env` | `ADMIN_PASSWORD`, `SESSION_SECRET`, `DATABASE_URL` |
| `prisma/schema.prisma` | `Suggestion` model |
| `src/lib/types.ts` | Shared domain types |
| `src/lib/cities.ts` | City metadata, default map views |
| `src/lib/group-markers.ts` | Group startups into single vs hub markers |
| `src/lib/merge-startups.ts` | Merge seed JSON + approved DB rows |
| `src/lib/validation.ts` | Suggest + approve field validation |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Password check + signed session cookie helpers |
| `src/data/buildings.json` | Hub definitions |
| `src/data/startups/{city}.json` | Curated seed per city |
| `src/app/layout.tsx`, `globals.css`, `page.tsx` | Shell + home |
| `src/app/maps/[city]/page.tsx` | City map route |
| `src/app/suggest/page.tsx` | Suggest form route |
| `src/app/admin/page.tsx` | Admin login + queue |
| `src/app/api/startups/[city]/route.ts` | Public merged startups |
| `src/app/api/suggestions/route.ts` | POST pending suggestion |
| `src/app/api/admin/login/route.ts` | Admin login |
| `src/app/api/admin/logout/route.ts` | Admin logout |
| `src/app/api/admin/suggestions/route.ts` | List pending (auth) |
| `src/app/api/admin/suggestions/[id]/route.ts` | Approve / Reject (auth) |
| `src/components/map/*` | Map, bubbles, cluster expand, detail, chrome |
| `src/components/home/*` | Hero + city entry |
| `src/components/suggest/SuggestForm.tsx` | Public form |
| `src/components/admin/*` | Login + pending queue + approve fields |
| `src/lib/__tests__/*.test.ts` | Unit tests |

---

### Task 1: Scaffold Next.js app and design tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.env.example`, `.gitignore` (extend), `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (placeholder)
- Test: manual `npm run dev` + `npm test` smoke

**Interfaces:**
- Consumes: none
- Produces: runnable Next app; CSS variables `--ink`, `--teal`, `--map-land`, `--paper`, fonts wired in `layout.tsx`

- [ ] **Step 1: Scaffold the app**

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --tailwind --no-turbopack --import-alias "@/*" --use-npm
```

If the directory is non-empty, create in a temp folder and move files, or manually create the same structure. Keep existing `docs/`, `AGENTS.md`, `.gitignore`.

- [ ] **Step 2: Add map/test/db dependencies**

```bash
npm install leaflet react-leaflet prisma @prisma/client iron-session zod
npm install -D vitest @vitejs/plugin-react jsdom @types/leaflet @types/react-leaflet
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Design tokens in `src/app/globals.css`**

```css
:root {
  --ink: #0c1b24;
  --teal: #0f6b6b;
  --teal-deep: #0a4f4f;
  --paper: #f3f5f4;
  --muted: #5c6b73;
  --map-shadow: 0 6px 18px rgba(12, 27, 36, 0.18);
  --font-display: "Fraunces", Georgia, serif;
  --font-ui: "DM Sans", "Segoe UI", sans-serif;
}

html, body {
  margin: 0;
  min-height: 100%;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-ui);
}
```

In `layout.tsx`, load Fraunces + DM Sans via `next/font/google` and set brand title `Australian Startup Map`.

- [ ] **Step 5: Env example**

`.env.example`:

```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="change-me"
SESSION_SECRET="replace-with-32-plus-char-random-string"
```

Copy to `.env` for local use (do not commit `.env`).

- [ ] **Step 6: Verify scaffold**

```bash
npm test
npm run build
```

Expected: Vitest finds 0 tests (or passes); build succeeds with placeholder page.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with map stack and design tokens"
```

---

### Task 2: Domain types, cities config, group-markers (TDD)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/cities.ts`, `src/lib/group-markers.ts`, `src/lib/__tests__/group-markers.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type CitySlug = "brisbane" | "sydney" | "melbourne" | "adelaide" | "perth"`
  - `export type Startup = { id: string; name: string; city: CitySlug; lat: number; lng: number; logoUrl?: string; website?: string; blurb?: string; buildingId?: string; buildingName?: string; sector?: string }`
  - `export type Building = { id: string; name: string; city: CitySlug; lat: number; lng: number }`
  - `export type MapMarker = { kind: "single"; startup: Startup } | { kind: "hub"; buildingId: string; buildingName: string; lat: number; lng: number; startups: Startup[] }`
  - `export function groupMarkers(startups: Startup[], buildings: Building[]): MapMarker[]`
  - `export const CITIES: Record<CitySlug, { name: string; center: [number, number]; zoom: number }>`

- [ ] **Step 1: Write failing tests**

`src/lib/__tests__/group-markers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { groupMarkers } from "@/lib/group-markers";
import type { Building, Startup } from "@/lib/types";

const buildings: Building[] = [
  { id: "brisbane-the-precinct", name: "The Precinct", city: "brisbane", lat: -27.467, lng: 153.028 },
];

describe("groupMarkers", () => {
  it("returns single markers when no buildingId", () => {
    const startups: Startup[] = [
      { id: "a", name: "Alpha", city: "brisbane", lat: -27.46, lng: 153.02 },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({ kind: "single", startup: { id: "a" } });
  });

  it("groups two startups with the same buildingId into one hub", () => {
    const startups: Startup[] = [
      { id: "a", name: "A", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
      { id: "b", name: "B", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      kind: "hub",
      buildingId: "brisbane-the-precinct",
      buildingName: "The Precinct",
    });
    if (markers[0].kind === "hub") {
      expect(markers[0].startups).toHaveLength(2);
    }
  });

  it("keeps a lone buildingId startup as single", () => {
    const startups: Startup[] = [
      { id: "a", name: "A", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers[0]?.kind).toBe("single");
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — cannot resolve `@/lib/group-markers` or `groupMarkers` undefined.

- [ ] **Step 3: Implement types, cities, groupMarkers**

`src/lib/types.ts` — export `CitySlug`, `Startup`, `Building`, `MapMarker`, `SuggestionStatus = "pending" | "approved" | "rejected"`.

`src/lib/cities.ts`:

```ts
import type { CitySlug } from "./types";

export const CITY_SLUGS: CitySlug[] = [
  "brisbane", "sydney", "melbourne", "adelaide", "perth",
];

export const CITIES: Record<
  CitySlug,
  { name: string; center: [number, number]; zoom: number }
> = {
  brisbane: { name: "Brisbane", center: [-27.4698, 153.0251], zoom: 13 },
  sydney: { name: "Sydney", center: [-33.8688, 151.2093], zoom: 13 },
  melbourne: { name: "Melbourne", center: [-37.8136, 144.9631], zoom: 13 },
  adelaide: { name: "Adelaide", center: [-34.9285, 138.6007], zoom: 13 },
  perth: { name: "Perth", center: [-31.9523, 115.8613], zoom: 13 },
};

export function isCitySlug(value: string): value is CitySlug {
  return (CITY_SLUGS as string[]).includes(value);
}
```

`src/lib/group-markers.ts`:

```ts
import type { Building, MapMarker, Startup } from "./types";

export function groupMarkers(
  startups: Startup[],
  buildings: Building[],
): MapMarker[] {
  const byBuilding = new Map<string, Startup[]>();
  const singles: Startup[] = [];

  for (const s of startups) {
    if (!s.buildingId) {
      singles.push(s);
      continue;
    }
    const list = byBuilding.get(s.buildingId) ?? [];
    list.push(s);
    byBuilding.set(s.buildingId, list);
  }

  const markers: MapMarker[] = singles.map((startup) => ({
    kind: "single",
    startup,
  }));

  for (const [buildingId, members] of byBuilding) {
    if (members.length === 1) {
      markers.push({ kind: "single", startup: members[0] });
      continue;
    }
    const building = buildings.find((b) => b.id === buildingId);
    const lat = building?.lat ?? members[0].lat;
    const lng = building?.lng ?? members[0].lng;
    const buildingName =
      building?.name ?? members[0].buildingName ?? "Startup hub";
    markers.push({
      kind: "hub",
      buildingId,
      buildingName,
      lat,
      lng,
      startups: members,
    });
  }

  return markers;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: all `groupMarkers` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/cities.ts src/lib/group-markers.ts src/lib/__tests__/group-markers.test.ts
git commit -m "feat: add city types and building-hub marker grouping"
```

---

### Task 3: Merge seed + approved startups (TDD)

**Files:**
- Create: `src/lib/merge-startups.ts`, `src/lib/__tests__/merge-startups.test.ts`

**Interfaces:**
- Consumes: `Startup` from `types.ts`
- Produces: `export function mergeStartups(seed: Startup[], approved: Startup[]): Startup[]` — approved wins on same `id`; also skip approved that match seed by normalized `name+city` when ids differ (keep seed id)

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { mergeStartups } from "@/lib/merge-startups";
import type { Startup } from "@/lib/types";

const seed: Startup[] = [
  { id: "seed-1", name: "Canva", city: "sydney", lat: -33.87, lng: 151.21 },
];

describe("mergeStartups", () => {
  it("includes approved startups not in seed", () => {
    const approved: Startup[] = [
      { id: "db-1", name: "NewCo", city: "sydney", lat: -33.86, lng: 151.2 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result.map((s) => s.id).sort()).toEqual(["db-1", "seed-1"]);
  });

  it("does not include duplicates by normalized name+city", () => {
    const approved: Startup[] = [
      { id: "db-canva", name: " canva ", city: "sydney", lat: -33.87, lng: 151.21 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("seed-1");
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement**

```ts
import type { Startup } from "./types";

function keyOf(s: Startup): string {
  return `${s.city}::${s.name.trim().toLowerCase()}`;
}

export function mergeStartups(seed: Startup[], approved: Startup[]): Startup[] {
  const byKey = new Map<string, Startup>();
  for (const s of seed) byKey.set(keyOf(s), s);
  for (const s of approved) {
    const k = keyOf(s);
    if (byKey.has(k)) continue;
    byKey.set(k, s);
  }
  return Array.from(byKey.values());
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/merge-startups.ts src/lib/__tests__/merge-startups.test.ts
git commit -m "feat: merge curated seed startups with approved suggestions"
```

---

### Task 4: Brisbane seed data + buildings JSON

**Files:**
- Create: `src/data/buildings.json`, `src/data/startups/brisbane.json`, `src/lib/load-seed.ts`
- Later cities can be empty arrays until Task 10

**Interfaces:**
- Consumes: `Startup`, `Building`, `CitySlug`
- Produces: `export function loadBuildings(): Building[]`, `export function loadSeedStartups(city: CitySlug): Startup[]`
- Brisbane JSON must include **at least 40** startups and at least one hub (`brisbane-the-precinct`) with **≥3** members sharing that `buildingId`

- [ ] **Step 1: Create `buildings.json`**

Include The Precinct (Brisbane) plus 1–2 plausible hubs per other city (Stone & Chalk / Docklands-style placeholders with real-ish coords). Example Precinct entry:

```json
{
  "id": "brisbane-the-precinct",
  "name": "The Precinct",
  "city": "brisbane",
  "lat": -27.4695,
  "lng": 153.0248
}
```

- [ ] **Step 2: Create dense `brisbane.json`**

Hand-curate ~40–60 well-known Brisbane / SEQ startups and scaleups (e.g. relevant local HQs). Use `logo.dev` or Clearbit-style URLs (`https://img.logo.dev/{domain}?token=...` only if a public token is configured; otherwise use `https://logo.clearbit.com/{domain}` or omit `logoUrl` for initials). Every Precinct member shares `buildingId: "brisbane-the-precinct"` and Precinct lat/lng.

- [ ] **Step 3: Stub other city files**

Create `sydney.json`, `melbourne.json`, `adelaide.json`, `perth.json` as `[]` for now (filled in Task 10).

- [ ] **Step 4: `load-seed.ts`**

```ts
import type { Building, CitySlug, Startup } from "./types";
import buildings from "@/data/buildings.json";
import brisbane from "@/data/startups/brisbane.json";
import sydney from "@/data/startups/sydney.json";
import melbourne from "@/data/startups/melbourne.json";
import adelaide from "@/data/startups/adelaide.json";
import perth from "@/data/startups/perth.json";

const SEED: Record<CitySlug, Startup[]> = {
  brisbane: brisbane as Startup[],
  sydney: sydney as Startup[],
  melbourne: melbourne as Startup[],
  adelaide: adelaide as Startup[],
  perth: perth as Startup[],
};

export function loadBuildings(): Building[] {
  return buildings as Building[];
}

export function loadSeedStartups(city: CitySlug): Startup[] {
  return SEED[city] ?? [];
}
```

Enable `resolveJsonModule` in `tsconfig.json` if needed.

- [ ] **Step 5: Sanity check**

```bash
npx tsx -e "const { loadSeedStartups, loadBuildings } = require('./src/lib/load-seed.ts'); console.log(loadSeedStartups('brisbane').length, loadBuildings().length)"
```

Or a tiny vitest: `expect(loadSeedStartups("brisbane").length).toBeGreaterThanOrEqual(40)`.

- [ ] **Step 6: Commit**

```bash
git add src/data src/lib/load-seed.ts
git commit -m "feat: add Brisbane seed startups and building hubs"
```

---

### Task 5: Prisma Suggestion model + DB client

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`
- Modify: `package.json` scripts (`db:push`, `db:studio`)

**Interfaces:**
- Consumes: env `DATABASE_URL`
- Produces: Prisma model `Suggestion`; `export const prisma` singleton from `db.ts`

- [ ] **Step 1: Schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Suggestion {
  id             String   @id @default(cuid())
  name           String
  city           String
  addressOrBuilding String
  website        String?
  logoUrl        String?
  blurb          String?
  sector         String?
  submitterEmail String?
  lat            Float?
  lng            Float?
  buildingId     String?
  buildingName   String?
  status         String   @default("pending")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([status])
  @@index([city])
}
```

- [ ] **Step 2: Client singleton `src/lib/db.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Push schema**

```bash
npx prisma generate
npx prisma db push
```

Expected: `dev.db` created; no errors.

- [ ] **Step 4: Commit** (do not commit `prisma/dev.db` — add `*.db` to `.gitignore`)

```bash
git add prisma/schema.prisma src/lib/db.ts .gitignore package.json
git commit -m "feat: add Prisma Suggestion model for review queue"
```

---

### Task 6: Validation helpers (TDD)

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/__tests__/validation.test.ts`

**Interfaces:**
- Consumes: `CitySlug`, `isCitySlug`
- Produces:
  - `export function parseSuggestionInput(body: unknown): { ok: true; data: SuggestionInput } | { ok: false; error: string }`
  - `export function parseApproveInput(body: unknown): { ok: true; data: { lat: number; lng: number; buildingId?: string; buildingName?: string; blurb?: string } } | { ok: false; error: string }`
  - `SuggestionInput` requires `name`, `city`, `addressOrBuilding`; optional website, logoUrl, email, blurb, sector

- [ ] **Step 1: Failing tests** — reject empty name; reject bad city; accept valid payload; approve requires finite lat/lng.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement with `zod` schemas matching the interfaces above**

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: validate suggestion and approve payloads"
```

---

### Task 7: Public startups API + suggest API

**Files:**
- Create: `src/app/api/startups/[city]/route.ts`, `src/app/api/suggestions/route.ts`

**Interfaces:**
- Consumes: `isCitySlug`, `loadSeedStartups`, `loadBuildings`, `mergeStartups`, `prisma`, `parseSuggestionInput`, `groupMarkers`
- Produces:
  - `GET /api/startups/[city]` → `{ city, startups, buildings, markers, count }`
  - `POST /api/suggestions` → `{ id, status: "pending" }` or 400

- [ ] **Step 1: Implement GET startups**

```ts
// src/app/api/startups/[city]/route.ts
import { NextResponse } from "next/server";
import { isCitySlug } from "@/lib/cities";
import { loadBuildings, loadSeedStartups } from "@/lib/load-seed";
import { mergeStartups } from "@/lib/merge-startups";
import { groupMarkers } from "@/lib/group-markers";
import { prisma } from "@/lib/db";
import type { Startup } from "@/lib/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ city: string }> },
) {
  const { city } = await ctx.params;
  if (!isCitySlug(city)) {
    return NextResponse.json({ error: "Unknown city" }, { status: 404 });
  }
  const approvedRows = await prisma.suggestion.findMany({
    where: { status: "approved", city },
  });
  const approved: Startup[] = approvedRows
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({
      id: r.id,
      name: r.name,
      city: city,
      lat: r.lat as number,
      lng: r.lng as number,
      logoUrl: r.logoUrl ?? undefined,
      website: r.website ?? undefined,
      blurb: r.blurb ?? undefined,
      buildingId: r.buildingId ?? undefined,
      buildingName: r.buildingName ?? undefined,
      sector: r.sector ?? undefined,
    }));
  const startups = mergeStartups(loadSeedStartups(city), approved);
  const buildings = loadBuildings().filter((b) => b.city === city);
  const markers = groupMarkers(startups, buildings);
  return NextResponse.json({
    city,
    startups,
    buildings,
    markers,
    count: startups.length,
  });
}
```

- [ ] **Step 2: Implement POST suggestions** — parse body; `prisma.suggestion.create({ data: { ..., status: "pending" } })`; return 201.

- [ ] **Step 3: Manual smoke**

```bash
npm run dev
curl http://localhost:3000/api/startups/brisbane
curl -X POST http://localhost:3000/api/suggestions -H "content-type: application/json" -d "{\"name\":\"TestCo\",\"city\":\"brisbane\",\"addressOrBuilding\":\"The Precinct\"}"
```

Expected: Brisbane count ≥ 40; POST returns pending id.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add public startups and suggestion APIs"
```

---

### Task 8: Map UI components (Leaflet)

**Files:**
- Create:
  - `src/components/map/StartupMap.tsx`
  - `src/components/map/LogoBubbleMarker.tsx`
  - `src/components/map/HubMarker.tsx`
  - `src/components/map/ClusterExpand.tsx`
  - `src/components/map/StartupDetailPanel.tsx`
  - `src/components/map/CityChrome.tsx`
  - `src/components/map/InitialsAvatar.tsx`

**Interfaces:**
- Consumes: `MapMarker`, `Startup`, `CITIES`, city slug
- Produces: client components; `StartupMap` props `{ city: CitySlug; markers: MapMarker[]; startups: Startup[] }`
- Behavior: Carto light tiles `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`; single → detail panel; hub numbered bubble → expand logo grid → detail; map click closes expand/panel; search filters markers by name; broken images → initials

- [ ] **Step 1: `InitialsAvatar`** — circle with 1–2 letters from name, teal background.

- [ ] **Step 2: `LogoBubbleMarker` / `HubMarker`** — `divIcon` HTML circles (56px), box-shadow `var(--map-shadow)`; hub shows count in `--teal` circle.

- [ ] **Step 3: `ClusterExpand`** — absolute panel near hub with CSS grid of logos; click logo calls `onSelect(startup)`; close button.

- [ ] **Step 4: `StartupDetailPanel`** — slide-in from right (CSS transition); logo, name, blurb, building, external website link.

- [ ] **Step 5: `CityChrome`** — links to all five cities, count, search input, disclosure: “Curated / illustrative — not a complete census.”

- [ ] **Step 6: `StartupMap`** — `MapContainer` + `TileLayer` + markers; dynamic import with `ssr: false` from the page.

- [ ] **Step 7: Manual test on a throwaway page or city route stub** — hub expand + detail work on desktop width and ~390px width.

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add Leaflet logo bubbles, hub expand, and detail panel"
```

---

### Task 9: City map page + home page

**Files:**
- Create: `src/app/maps/[city]/page.tsx`, `src/components/home/HomeHero.tsx`, `src/components/home/CityEntry.tsx`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx` (nav link Suggest)

**Interfaces:**
- Consumes: startups API, map components, `CITIES`, `isCitySlug`
- Produces: working `/` and `/maps/[city]`

- [ ] **Step 1: City page** — `notFound()` if bad slug; server-fetch or client-fetch `/api/startups/[city]`; render `CityChrome` + dynamic `StartupMap`.

- [ ] **Step 2: Home** — full-bleed greyscale map atmosphere (subtle CSS gradient + soft map-like pattern OK if no photo asset); brand wordmark hero-level; one headline; one supporting sentence; CTA group linking to five cities (text links or large city names — not a card dashboard). Intentional motion: fade-in brand, slight rise on city links.

- [ ] **Step 3: Manual check** — home → Brisbane map → switch Sydney → search filters.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add home city entry and city map routes"
```

---

### Task 10: Seed remaining cities (~40–60 each)

**Files:**
- Modify: `src/data/startups/sydney.json`, `melbourne.json`, `adelaide.json`, `perth.json`
- Modify: `src/data/buildings.json` as needed for hubs

**Interfaces:**
- Same seed shape as Brisbane; at least one multi-startup hub per city where a real precinct exists

- [ ] **Step 1: Research and write dense JSON for Sydney** (≥40)

- [ ] **Step 2: Melbourne** (≥40)

- [ ] **Step 3: Adelaide** (≥40)

- [ ] **Step 4: Perth** (≥40)

- [ ] **Step 5: Vitest guard**

```ts
import { describe, expect, it } from "vitest";
import { CITY_SLUGS } from "@/lib/cities";
import { loadSeedStartups } from "@/lib/load-seed";

describe("seed density", () => {
  it.each(CITY_SLUGS)("%s has at least 40 startups", (city) => {
    expect(loadSeedStartups(city).length).toBeGreaterThanOrEqual(40);
  });
});
```

- [ ] **Step 6: `npm test` PASS; commit**

```bash
git commit -m "feat: densify seed data for all five Australian cities"
```

---

### Task 11: Suggest form UI

**Files:**
- Create: `src/app/suggest/page.tsx`, `src/components/suggest/SuggestForm.tsx`

**Interfaces:**
- Consumes: `POST /api/suggestions`, `CITY_SLUGS`
- Produces: form fields name, city select, addressOrBuilding, website, logoUrl, optional email; success copy exactly: `Thanks — we'll review before it appears on the map.`

- [ ] **Step 1: Build controlled form; disable submit while pending; show field errors from API**

- [ ] **Step 2: Manual POST via UI; confirm row `pending` in Prisma Studio**

```bash
npx prisma studio
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add public suggest-a-startup form"
```

---

### Task 12: Admin auth + Approve/Reject

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/logout/route.ts`, `src/app/api/admin/suggestions/route.ts`, `src/app/api/admin/suggestions/[id]/route.ts`, `src/app/admin/page.tsx`, `src/components/admin/LoginForm.tsx`, `src/components/admin/PendingQueue.tsx`

**Interfaces:**
- Consumes: `ADMIN_PASSWORD`, `SESSION_SECRET`, `iron-session`, `parseApproveInput`, `prisma`
- Produces:
  - Session cookie name `asm_admin` with `{ authenticated: true }`
  - `GET /api/admin/suggestions` → pending list (401 if not authed)
  - `POST /api/admin/suggestions/[id]` body `{ action: "approve", lat, lng, ... }` or `{ action: "reject" }`
  - Approve without lat/lng → 400
  - After approve, startup appears in `GET /api/startups/[city]`

- [ ] **Step 1: `auth.ts`** — `getSession()`, `requireAdmin()`, `loginWithPassword(password: string): boolean` comparing to `process.env.ADMIN_PASSWORD`.

- [ ] **Step 2: Login/logout routes**

- [ ] **Step 3: List + mutate suggestion routes** with `requireAdmin`

Approve path:

```ts
if (action === "approve") {
  const parsed = parseApproveInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await prisma.suggestion.update({
    where: { id },
    data: {
      status: "approved",
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      buildingId: parsed.data.buildingId,
      buildingName: parsed.data.buildingName,
      blurb: parsed.data.blurb,
    },
  });
}
```

Reject path sets `status: "rejected"`.

- [ ] **Step 4: Admin UI** — login form; pending cards with lat/lng inputs + Approve / Reject.

- [ ] **Step 5: E2E manual script**

1. Suggest “MapTest Co” for Brisbane  
2. Login `/admin` with wrong password → error  
3. Login with `ADMIN_PASSWORD` → see pending  
4. Approve with lat/lng  
5. `GET /api/startups/brisbane` includes MapTest Co  
6. Reject another → not on map  

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add password admin queue with approve and reject"
```

---

### Task 13: Polish motion, README, final QA

**Files:**
- Modify: map/home CSS for cluster expand + panel transitions; `README.md`

**Interfaces:**
- Consumes: existing UI
- Produces: documented `npm run dev`, env vars, seed disclosure; 2–3 motions live

- [ ] **Step 1: Motion** — home brand fade/rise; hub expand scale/fade; detail panel `transform: translateX` transition (~200–300ms).

- [ ] **Step 2: README** — setup, env, scripts, “curated/illustrative” note, city list.

- [ ] **Step 3: Final QA checklist**

- [ ] Desktop + mobile hub expand  
- [ ] All five cities load  
- [ ] Search filters  
- [ ] Suggest → approve → visible; reject → hidden  
- [ ] Broken logo → initials  
- [ ] No purple theme; teal accent present  

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: add README and polish map motion"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
| --- | --- |
| Five city maps | 9, 10 |
| Logo bubbles + numbered building hubs | 2, 8 |
| Hub click → logo grid → detail | 8 |
| Leaflet + Carto greyscale | 8 |
| Seed JSON + DB approved merge | 3, 4, 5, 7 |
| Suggest for review only | 7, 11 |
| Password admin Approve/Reject | 12 |
| lat/lng required before Approve | 6, 12 |
| Dense ~40–60 per city | 4, 10 |
| Curated/illustrative disclosure | 8, 13 |
| Brand-forward home | 9 |
| No Mapbox / no zoom clustering / no accounts | Global + omitted tasks |

**Gaps fixed during planning:** approve coordinate rule encoded in validation + admin API; seed density gated by test in Task 10.

**Type consistency:** `CitySlug`, `Startup`, `Building`, `MapMarker`, `groupMarkers`, `mergeStartups`, `parseSuggestionInput`, `parseApproveInput` used consistently across tasks.
