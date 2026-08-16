import type { Building, Startup } from "./types";

export function buildMergedSeed(
  startups: Startup[],
  buildings: Building[],
): { startups: Startup[]; buildings: Building[] } {
  return {
    startups: startups.map((s) => ({ ...s })),
    buildings: buildings.map((b) => ({ ...b })),
  };
}

