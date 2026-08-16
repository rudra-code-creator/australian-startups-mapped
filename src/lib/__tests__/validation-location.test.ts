import { describe, expect, it } from "vitest";
import { parseLocationCorrectionInput } from "@/lib/validation";

describe("parseLocationCorrectionInput", () => {
  it("accepts a valid startup move", () => {
    const res = parseLocationCorrectionInput({
      targetKind: "startup",
      targetId: "go1",
      city: "brisbane",
      name: "Go1",
      fromLat: -27.47,
      fromLng: 153.03,
      toLat: -27.48,
      toLng: 153.04,
    });
    expect(res.ok).toBe(true);
  });

  it("rejects invalid city", () => {
    const res = parseLocationCorrectionInput({
      targetKind: "startup",
      targetId: "go1",
      city: "hobart",
      name: "Go1",
      fromLat: -27.47,
      fromLng: 153.03,
      toLat: -27.48,
      toLng: 153.04,
    });
    expect(res.ok).toBe(false);
  });
});

