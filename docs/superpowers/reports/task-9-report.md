## Task 9 – City map page + home page

- Fixed the `/maps/[city]` page to load startups directly via a shared loader instead of reconstructing the host and HTTP self-fetching its own API.
- Added `src/lib/get-city-map-data.ts`, which validates the city slug, loads seed startups and city buildings, fetches approved suggestions from Prisma, merges them, groups markers, and returns `{ city, startups, buildings, markers, count }`.
- Updated `GET /api/startups/[city]` and the city page to both call `getCityMapData`, keeping `notFound()` behavior on bad slugs and ensuring a single source of truth for city map data.

