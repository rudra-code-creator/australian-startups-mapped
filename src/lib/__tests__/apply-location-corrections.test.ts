import { describe, expect, it } from "vitest";
import { applyLocationCorrections } from "@/lib/apply-location-corrections";
import type { Building, Startup } from "@/lib/types";

const seed: Startup[] = [
  {
    id: "go1",
    name: "Go1",
    city: "brisbane",
    lat: -27.4,
    lng: 153.0,
    buildingId: "brisbane-the-precinct",
  },
];
const buildings: Building[] = [
  {
    id: "brisbane-the-precinct",
    name: "The Precinct",
    city: "brisbane",
    lat: -27.46,
    lng: 153.01,
  },
];

describe("applyLocationCorrections", () => {
  it("overrides startup lat/lng and can clear buildingId", () => {
    const { startups } = applyLocationCorrections(seed, buildings, [
      {
        targetKind: "startup",
        targetId: "go1",
        toLat: -27.47,
        toLng: 153.03,
        clearBuildingId: true,
        updatedAt: new Date("2026-01-02"),
      },
    ]);
    expect(startups[0].lat).toBe(-27.47);
    expect(startups[0].buildingId).toBeUndefined();
  });

  it("uses latest approved correction per target", () => {
    const { buildings: b } = applyLocationCorrections(seed, buildings, [
      {
        targetKind: "building",
        targetId: "brisbane-the-precinct",
        toLat: -27.1,
        toLng: 153.1,
        clearBuildingId: false,
        updatedAt: new Date("2026-01-01"),
      },
      {
        targetKind: "building",
        targetId: "brisbane-the-precinct",
        toLat: -27.2,
        toLng: 153.2,
        clearBuildingId: false,
        updatedAt: new Date("2026-01-03"),
      },
    ]);
    expect(b[0].lat).toBe(-27.2);
    expect(b[0].lng).toBe(153.2);
  });
});

