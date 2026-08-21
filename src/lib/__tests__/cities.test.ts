import { describe, expect, it } from "vitest";
import {
  CITY_SLUGS,
  COUNTRIES,
  GBA_CITY_SLUGS,
  SIJORI_CITY_SLUGS,
  isCitySlug,
  linkedMapSlugs,
  mapViewport,
} from "@/lib/cities";

describe("city registry", () => {
  it("sections every city under exactly one country", () => {
    const grouped = COUNTRIES.flatMap((country) => country.citySlugs);
    expect(grouped).toEqual(CITY_SLUGS);
    expect(new Set(grouped).size).toBe(CITY_SLUGS.length);
  });

  it("accepts known slugs and rejects unknown ones", () => {
    expect(isCitySlug("auckland")).toBe(true);
    expect(isCitySlug("singapore")).toBe(true);
    expect(isCitySlug("bangalore")).toBe(true);
    expect(isCitySlug("hong-kong")).toBe(true);
    expect(isCitySlug("delhi-ncr")).toBe(true);
    expect(isCitySlug("not-a-city")).toBe(false);
  });

  it("treats Singapore, Johor Bahru, and Batam as one map", () => {
    for (const city of SIJORI_CITY_SLUGS) {
      expect(linkedMapSlugs(city)).toEqual(SIJORI_CITY_SLUGS);
      expect(mapViewport(city)).toEqual(mapViewport("singapore"));
    }
  });

  it("treats Greater Bay Area cities as one map", () => {
    for (const city of GBA_CITY_SLUGS) {
      expect(linkedMapSlugs(city)).toEqual(GBA_CITY_SLUGS);
      expect(mapViewport(city)).toEqual(mapViewport("hong-kong"));
    }
  });
});
