import { describe, expect, it } from "vitest";
import { CITY_SLUGS } from "@/lib/cities";
import { loadSeedStartups } from "@/lib/load-seed";

describe("seed density", () => {
  it.each(CITY_SLUGS)("%s has at least 40 startups", (city) => {
    expect(loadSeedStartups(city).length).toBeGreaterThanOrEqual(40);
  });
});

