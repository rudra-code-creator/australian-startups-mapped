import { describe, expect, it } from "vitest";
import { metersBetween, MIN_CORRECTION_METERS } from "@/lib/geo";

describe("geo", () => {
  it("returns ~0 for identical points", () => {
    expect(metersBetween({ lat: -27.47, lng: 153.03 }, { lat: -27.47, lng: 153.03 })).toBeLessThan(1);
  });

  it("treats a ~10m nudge as below threshold", () => {
    const a = { lat: -27.47, lng: 153.03 };
    const b = { lat: -27.47009, lng: 153.03 }; // ~10m north
    expect(metersBetween(a, b)).toBeLessThan(MIN_CORRECTION_METERS);
  });

  it("treats a ~100m move as above threshold", () => {
    const a = { lat: -27.47, lng: 153.03 };
    const b = { lat: -27.471, lng: 153.03 }; // ~111m
    expect(metersBetween(a, b)).toBeGreaterThan(MIN_CORRECTION_METERS);
  });
});

