import { describe, expect, it } from "vitest";
import { loadBuildings, loadSeedStartups } from "@/lib/load-seed";

describe("load-seed", () => {
  it("loads Brisbane seed startups (>= 40)", () => {
    expect(loadSeedStartups("brisbane").length).toBeGreaterThanOrEqual(40);
  });

  it("includes The Precinct building", () => {
    expect(loadBuildings().some((b) => b.id === "brisbane-the-precinct")).toBe(
      true,
    );
  });
});

