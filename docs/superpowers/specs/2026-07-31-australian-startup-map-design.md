# Australian Startup Map — Design Spec

**Date:** 2026-07-31  
**Status:** Approved for implementation planning  
**Product working title:** Australian Startup Map

## 1. Problem & goal

People discover a city’s startup energy by seeing where notable companies sit on a map—logo bubbles clustered in the CBD or main tech precinct. This product does that for major Australian cities: Brisbane, Sydney, Melbourne, Adelaide, and Perth.

**Success for v1:** A visitor can open a city map, see dense office clustering (including numbered building hubs), inspect startups, suggest additions, and an admin can approve or reject suggestions before they go live.

## 2. Decisions locked

| Topic | Choice |
| --- | --- |
| Data model | Curated seed JSON + community “suggest a startup” |
| Suggestion policy | Submit for review only; nothing live until approved |
| Admin | Password-protected page with Approve / Reject |
| Map stack | Leaflet + free greyscale tiles (e.g. Carto light) |
| Seed density | ~40–60 notable startups per city |
| Architecture | Next.js + Leaflet + versioned seed JSON + small DB for suggestions/approvals |

## 3. Architecture

### Stack

- **App:** Next.js (App Router) + TypeScript
- **Maps:** Leaflet, Carto light/grey basemap (no Mapbox in v1)
- **Curated data:** Versioned JSON (or TS modules) under source control
- **Suggestions / approvals:** Small DB — SQLite locally; may point at a hosted DB for deploy later
- **Admin auth:** Shared password via env secret; session cookie after login (no public user accounts)

### Live map data merge

At read time the map loads:

1. Curated seed startups for the city
2. DB rows with `status = approved`

Deduplicate by stable `id` or normalized name+city if needed. Rejected and pending suggestions never appear on the public map.

### Main surfaces

| Route | Purpose |
| --- | --- |
| `/` | Brand-forward home; city entry into maps |
| `/maps/[city]` | Full city map (bubbles, hubs, detail) |
| `/suggest` | Public suggestion form |
| `/admin` | Password gate + pending queue (Approve / Reject) |

Cities: `brisbane` | `sydney` | `melbourne` | `adelaide` | `perth`.

## 4. Map & cluster UX

### Markers

- **Single HQ:** Circular logo bubble + short name label; subtle drop shadow.
- **Same building / hub:** Shared `buildingId` (e.g. `brisbane-the-precinct`) → one numbered bubble (count of member startups) with optional hub name. Do **not** stack overlapping individual logos for the same building.

### Click behavior

- **Single startup:** Opens detail panel (logo, name, one-line blurb, website, suburb/building).
- **Cluster / hub:** Expands in place or in a compact popover into a grid of member logos; clicking a logo opens the same detail panel. Map click or explicit close collapses the cluster.

### City chrome

- City switcher across the five cities
- Active-city startup count
- Search by name (v1)
- Optional stretch: filter by sector (not required for launch)
- Initial viewport zoomed to that city’s main CBD / tech cluster

### Clustering rule (explicit)

Clustering is **building/hub co-location only** (`buildingId`). No generic zoom-based marker clustering. Nearby offices at different addresses remain separate bubbles.

## 5. Data model

### Building / hub

```ts
{
  id: string;          // e.g. "brisbane-the-precinct"
  name: string;        // e.g. "The Precinct"
  city: CitySlug;
  lat: number;
  lng: number;
}
```

### Startup (seed + approved)

```ts
{
  id: string;
  name: string;
  city: CitySlug;
  lat: number;
  lng: number;
  logoUrl?: string;
  website?: string;
  blurb?: string;
  buildingId?: string;
  buildingName?: string;
  sector?: string;
}
```

Startups in a hub use the hub’s coordinates (or their own if identical) and the shared `buildingId`. The map renderer groups by `buildingId` when present and count > 1.

### Suggestion (DB)

- Submitter optional email
- Same startup fields as above; city, name, and address or building name required
- `lat` / `lng` optional on submit; **required before Approve** (admin enters coordinates or a simple geocode helper fills them on approve)
- `status`: `pending` | `approved` | `rejected`
- `createdAt`, `updatedAt`

Public form creates `pending` only.

### Logos

Prefer Clearbit / logo.dev-style or direct image URLs. On failure, render initials avatar. Seed set uses real-ish known Australian startups where possible; hubs share `buildingId`.

### Disclosure

UI copy labels seed data as **curated / illustrative**, not an official census of all startups.

## 6. Suggest & admin flows

### Suggest

1. User submits name, city, address or building, website, logo URL (optional email).
2. Server validates and inserts `pending`.
3. Confirmation: “Thanks — we’ll review before it appears on the map.”

### Admin

1. Admin opens `/admin`, enters password (env `ADMIN_PASSWORD` or equivalent).
2. Session cookie grants access to pending list.
3. **Approve:** Mark approved (and ensure required fields for map display are present); appears on next map load via merge.
4. **Reject:** Mark rejected; hidden from queue (or filterable).

No public accounts, audit log UI, or role system in v1.

## 7. Visual design

- Map-first; light greyscale cartography
- Soft shadows on logo bubbles
- Single accent: deep teal or ink blue (not purple)
- Expressive display font for brand wordmark; clean sans for UI chrome
- Home: one composition — brand-forward hero into city entry; not a dashboard of cards/stats in the first viewport
- Motion (intentional, 2–3): city switch zoom/crossfade; cluster expand to logo grid; detail panel slide-in

Follow existing frontend design constraints: no purple-on-white default aesthetic, no cream+terracotta+serif cliché, no broadsheet dense columns, no card-heavy hero.

## 8. Out of scope (v1)

- User accounts / social features / comments
- Funding rounds, headcount, or investor data
- Zoom-based generic clustering
- Mapbox or paid map styles
- Mobile native apps
- Automated scraping or live external startup APIs
- Full sector taxonomy and advanced filters (optional stretch only)

## 9. Quality bar & testing

- Desktop and mobile: tap cluster → expand → tap logo → detail
- Suggest → appears in admin pending → Approve → visible on city map; Reject → never on map
- Admin password rejection without valid session
- Broken `logoUrl` falls back to initials
- Seed density target: ~40–60 startups per city at launch (may land in batches if needed, but target is dense)

## 10. Implementation notes (non-binding)

Recommended first vertical slice: Brisbane map with seed JSON + building hub expand, then city switcher, then suggest + admin + DB merge. Exact task breakdown belongs in the implementation plan after this spec is accepted.
