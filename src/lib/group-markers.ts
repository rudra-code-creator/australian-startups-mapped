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

