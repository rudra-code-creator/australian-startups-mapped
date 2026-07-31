import { describe, expect, it } from "vitest";
import { groupMarkers } from "@/lib/group-markers";
import type { Building, Startup } from "@/lib/types";

const buildings: Building[] = [
  { id: "brisbane-the-precinct", name: "The Precinct", city: "brisbane", lat: -27.467, lng: 153.028 },
];

describe("groupMarkers", () => {
  it("returns single markers when no buildingId", () => {
    const startups: Startup[] = [
      { id: "a", name: "Alpha", city: "brisbane", lat: -27.46, lng: 153.02 },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({ kind: "single", startup: { id: "a" } });
  });

  it("groups two startups with the same buildingId into one hub", () => {
    const startups: Startup[] = [
      { id: "a", name: "A", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
      { id: "b", name: "B", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      kind: "hub",
      buildingId: "brisbane-the-precinct",
      buildingName: "The Precinct",
    });
    if (markers[0].kind === "hub") {
      expect(markers[0].startups).toHaveLength(2);
    }
  });

  it("keeps a lone buildingId startup as single", () => {
    const startups: Startup[] = [
      { id: "a", name: "A", city: "brisbane", lat: -27.467, lng: 153.028, buildingId: "brisbane-the-precinct" },
    ];
    const markers = groupMarkers(startups, buildings);
    expect(markers[0]?.kind).toBe("single");
  });
});

