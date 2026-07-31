import { describe, expect, it } from "vitest";
import { mergeStartups } from "@/lib/merge-startups";
import type { Startup } from "@/lib/types";

const seed: Startup[] = [
  { id: "seed-1", name: "Canva", city: "sydney", lat: -33.87, lng: 151.21 },
];

describe("mergeStartups", () => {
  it("includes approved startups not in seed", () => {
    const approved: Startup[] = [
      { id: "db-1", name: "NewCo", city: "sydney", lat: -33.86, lng: 151.2 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result.map((s) => s.id).sort()).toEqual(["db-1", "seed-1"]);
  });

  it("does not include duplicates by normalized name+city", () => {
    const approved: Startup[] = [
      { id: "db-canva", name: " canva ", city: "sydney", lat: -33.87, lng: 151.21 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("seed-1");
  });

  it("approved overrides seed when ids match (fields come from approved)", () => {
    const approved: Startup[] = [
      { id: "seed-1", name: "Canva", city: "sydney", lat: -33.9, lng: 151.25 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result).toHaveLength(1);
    const s = result.find((r) => r.id === "seed-1")!;
    expect(s.lat).toBe(-33.9);
    expect(s.lng).toBe(151.25);
  });

  it("approved with same id but changed name/city replaces old key", () => {
    const approved: Startup[] = [
      { id: "seed-1", name: "Canva Pty", city: "melbourne", lat: -37.81, lng: 144.96 },
    ];
    const result = mergeStartups(seed, approved);
    expect(result).toHaveLength(1);
    const s = result[0];
    expect(s.id).toBe("seed-1");
    expect(s.name).toBe("Canva Pty");
    expect(s.city).toBe("melbourne");
    // old normalized key (sydney::canva) should not exist
    expect(result.some((r) => r.city === "sydney" && r.name.trim().toLowerCase() === "canva")).toBe(false);
  });
});

