## Learned User Preferences

- Wants community-editable maps: curated seed data plus a public “suggest a startup” flow for v1
- Suggestions must submit for review only; nothing appears on the live map until approved
- Prefers a simple password-protected admin page with Approve / Reject over email-only or full accounts
- Prefers Leaflet with free greyscale tiles (e.g. Carto) over Mapbox for v1
- Wants dense seed coverage (~40–60 notable startups per city), not a thin showcase set
- Chose Next.js + Leaflet + versioned seed JSON + a small DB for suggestions/approvals (not all-in-Postgres or third-party forms only)
- Approves map-first UX: building/hub numbered cluster bubbles that expand to logos; no zoom-based generic clustering
- Visual direction: light greyscale cartography, soft logo-bubble shadows, deep teal or ink blue accent (not purple), brand-forward home composition rather than a dashboard landing

## Learned Workspace Facts

- Product is an Australian startup office map covering Brisbane, Sydney, Melbourne, Adelaide, and Perth
- Planned stack: Next.js (App Router) + TypeScript + Leaflet (Carto light/grey tiles)
- Curated startups live in versioned JSON; suggestions and approval state live in a small DB (SQLite locally, hosted DB later)
- Same-building hubs (e.g. Brisbane’s The Precinct) share a `buildingId` and render as one numbered bubble that expands to member logos
- Main surfaces: home city entry, `/maps/[city]`, public suggest form, password-gated `/admin` queue
- Seed data should be labeled curated/illustrative, not an official census; logos may use Clearbit/logo.dev-style URLs with initials fallback
