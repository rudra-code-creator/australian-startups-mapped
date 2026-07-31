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
});

