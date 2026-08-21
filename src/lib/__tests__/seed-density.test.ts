import { describe, expect, it } from "vitest";
import {
  CITY_SLUGS,
  GBA_CITY_SLUGS,
  SIJORI_CITY_SLUGS,
  minSeedCount,
} from "@/lib/cities";
import { FUNDING_STAGES } from "@/lib/types";
import { loadMapStartups, loadSeedStartups } from "@/lib/load-seed";

describe("seed density", () => {
  it.each(CITY_SLUGS)("%s meets its ecosystem minimum", (city) => {
    const startups = loadSeedStartups(city);
    expect(startups.length).toBeGreaterThanOrEqual(minSeedCount(city));
    expect(startups.every((startup) => startup.city === city)).toBe(true);
    expect(new Set(startups.map((startup) => startup.id)).size).toBe(
      startups.length,
    );
  });

  it("labels every seed startup with a funding stage", () => {
    for (const city of CITY_SLUGS) {
      for (const startup of loadSeedStartups(city)) {
        expect(startup.fundingStage).toBeTruthy();
        expect(FUNDING_STAGES).toContain(startup.fundingStage);
      }
    }
  });

  it("places Wellington coverage across Porirua and the Hutt Valley", () => {
    const text = loadSeedStartups("wellington")
      .map((startup) => `${startup.name} ${startup.address ?? ""}`)
      .join(" ")
      .toLowerCase();
    expect(text).toContain("porirua");
    expect(text).toContain("lower hutt");
    expect(text).toContain("upper hutt");
  });

  it("places Klang Valley coverage across Kuala Lumpur, Klang, and Seremban", () => {
    const text = loadSeedStartups("klang-valley")
      .map((startup) => `${startup.name} ${startup.address ?? ""}`)
      .join(" ")
      .toLowerCase();
    expect(text).toContain("kuala lumpur");
    expect(text).toContain("klang");
    expect(text).toContain("seremban");
  });

  it("loads Singapore, Johor Bahru, and Batam together on any of those maps", () => {
    const cities = new Set(
      loadMapStartups("singapore").map((startup) => startup.city),
    );
    expect([...cities].sort()).toEqual([...SIJORI_CITY_SLUGS].sort());
    expect(loadMapStartups("batam").length).toBe(
      loadMapStartups("johor-bahru").length,
    );
    const ids = loadMapStartups("singapore").map((startup) => startup.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("loads Greater Bay Area cities together on any of those maps", () => {
    const cities = new Set(
      loadMapStartups("hong-kong").map((startup) => startup.city),
    );
    expect([...cities].sort()).toEqual([...GBA_CITY_SLUGS].sort());
    expect(loadMapStartups("shenzhen").length).toBe(
      loadMapStartups("zhuhai").length,
    );
    const ids = loadMapStartups("guangzhou").map((startup) => startup.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("places Delhi-NCR coverage across Gurugram / Noida", () => {
    const text = loadSeedStartups("delhi-ncr")
      .map((startup) => `${startup.name} ${startup.address ?? ""}`)
      .join(" ")
      .toLowerCase();
    expect(text.includes("gurugram") || text.includes("gurgaon")).toBe(true);
    expect(text).toContain("noida");
  });
});
