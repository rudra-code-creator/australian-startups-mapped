import type { Building, LocationTargetKind, Startup } from "./types";

export type CorrectionApplyRow = {
  targetKind: LocationTargetKind | string;
  targetId: string;
  toLat: number;
  toLng: number;
  clearBuildingId: boolean;
  updatedAt: Date | string;
};

function latestByTarget(rows: CorrectionApplyRow[]) {
  const map = new Map<string, CorrectionApplyRow>();
  for (const row of rows) {
    const key = `${row.targetKind}::${row.targetId}`;
    const prev = map.get(key);
    const t = new Date(row.updatedAt).getTime();
    if (!prev || t >= new Date(prev.updatedAt).getTime()) map.set(key, row);
  }
  return map;
}

export function applyLocationCorrections(
  startups: Startup[],
  buildings: Building[],
  corrections: CorrectionApplyRow[],
): { startups: Startup[]; buildings: Building[] } {
  const latest = latestByTarget(corrections);
  const nextStartups = startups.map((s) => {
    const row = latest.get(`startup::${s.id}`);
    if (!row) return s;
    const next: Startup = { ...s, lat: row.toLat, lng: row.toLng };
    if (row.clearBuildingId) {
      delete next.buildingId;
      delete next.buildingName;
    }
    return next;
  });
  const nextBuildings = buildings.map((b) => {
    const row = latest.get(`building::${b.id}`);
    if (!row) return b;
    return { ...b, lat: row.toLat, lng: row.toLng };
  });
  return { startups: nextStartups, buildings: nextBuildings };
}

