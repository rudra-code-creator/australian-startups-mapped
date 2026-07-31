import { enrichStartupPresentation } from "./branding";
import { isCitySlug } from "./cities";
import { loadBuildings, loadSeedStartups } from "./load-seed";
import { mergeStartups } from "./merge-startups";
import { groupMarkers } from "./group-markers";
import { prisma } from "./db";
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

  const approvedRows = await prisma.suggestion.findMany({
    where: { status: "approved", city },
  });

  const approved: Startup[] = approvedRows
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) =>
      enrichStartupPresentation({
        id: r.id,
        name: r.name,
        city,
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

  const startups = mergeStartups(loadSeedStartups(city), approved);
  const buildings = loadBuildings().filter((b) => b.city === city);
  const markers = groupMarkers(startups, buildings);

  return {
    city,
    startups,
    buildings,
    markers,
    count: startups.length,
  };
}

