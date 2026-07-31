import { describe, expect, it } from "vitest";
import {
  domainFromWebsite,
  logoCandidates,
  enrichStartupPresentation,
} from "@/lib/branding";

describe("branding", () => {
  it("extracts domain from website", () => {
    expect(domainFromWebsite("https://www.canva.com/about")).toBe("canva.com");
  });

  it("builds logo candidate chain with local + icon hosts", () => {
    const urls = logoCandidates({
      id: "go1",
      website: "https://go1.com",
    });
    expect(urls[0]).toBe("/logos/go1.png");
    expect(urls.some((u) => u.includes("icon.horse"))).toBe(true);
    expect(urls.some((u) => u.includes("google.com/s2/favicons"))).toBe(true);
  });

  it("enriches presentation with preview image", () => {
    const enriched = enrichStartupPresentation({
      id: "x",
      name: "Go1",
      city: "brisbane",
      lat: -27.4,
      lng: 153.0,
      website: "https://go1.com",
    });
    expect(enriched.logoUrl).toBeTruthy();
    expect(enriched.imageUrls?.[0]).toContain("mshots");
  });
});
