import { describe, expect, it } from "vitest";
import { buildMergedSeed } from "@/lib/build-merged-seed";
import type { Building, Startup } from "@/lib/types";

const startups: Startup[] = [
  {
    id: "go1",
    name: "Go1",
    city: "brisbane",
    lat: -27.47,
    lng: 153.03,
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

describe("buildMergedSeed", () => {
  it("returns shallow copies of startups and buildings", () => {
    const { startups: s2, buildings: b2 } = buildMergedSeed(startups, buildings);

    expect(s2).not.toBe(startups);
    expect(b2).not.toBe(buildings);
    expect(s2).toEqual(startups);
    expect(b2).toEqual(buildings);

    // mutating result should not affect originals
    s2[0].name = "Changed";
    b2[0].name = "Changed Building";

    expect(startups[0].name).toBe("Go1");
    expect(buildings[0].name).toBe("The Precinct");
  });
});

