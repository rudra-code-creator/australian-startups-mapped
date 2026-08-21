import { enrichStartupPresentation } from "./branding";
import { isCitySlug, linkedMapSlugs } from "./cities";
import { loadMapBuildings, loadMapStartups } from "./load-seed";
import { mergeStartups } from "./merge-startups";
import { groupMarkers } from "./group-markers";
import { prisma } from "./db";
import { applyLocationCorrections } from "./apply-location-corrections";
import type { Building, CitySlug, MapMarker, Startup } from "./types";

export type CityMapData = {
  city: CitySlug;
  startups: Startup[];
  buildings: Building[];
  markers: MapMarker[];
  count: number;
};

export async function getCityMapData(
  cityParam: string,
): Promise<CityMapData | null> {
  if (!isCitySlug(cityParam)) {
    return null;
  }

  const city: CitySlug = cityParam;
  const mapCities = linkedMapSlugs(city);

  let approvedRows: Awaited<ReturnType<typeof prisma.suggestion.findMany>> = [];
  let approvedCorrections: Awaited<
    ReturnType<typeof prisma.locationCorrection.findMany>
  > = [];

  try {
    approvedRows = await prisma.suggestion.findMany({
      where: { status: "approved", city: { in: mapCities } },
    });
    approvedCorrections = await prisma.locationCorrection.findMany({
      where: { status: "approved", city: { in: mapCities } },
    });
  } catch {
    // Seed-only when SQLite is missing or unmigrated (typical on Netlify).
  }

  const approved: Startup[] = approvedRows
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) =>
      enrichStartupPresentation({
        id: r.id,
        name: r.name,
        city: isCitySlug(r.city) ? r.city : city,
        lat: r.lat as number,
        lng: r.lng as number,
        logoUrl: r.logoUrl ?? undefined,
        website: r.website ?? undefined,
        blurb: r.blurb ?? undefined,
        address: r.addressOrBuilding || undefined,
        buildingId: r.buildingId ?? undefined,
        buildingName: r.buildingName ?? undefined,
        sector: r.sector ?? undefined,
      }),
    );

  const seedStartups = loadMapStartups(city);
  const seedBuildings = loadMapBuildings(city);
  const { startups: positioned, buildings } = applyLocationCorrections(
    seedStartups,
    seedBuildings,
    approvedCorrections,
  );
  const startups = mergeStartups(positioned, approved);
  const markers = groupMarkers(startups, buildings);

  return {
    city,
    startups,
    buildings,
    markers,
    count: startups.length,
  };
}

