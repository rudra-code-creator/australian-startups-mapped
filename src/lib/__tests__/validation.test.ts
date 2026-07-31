import { describe, it, expect } from "vitest";
import { parseSuggestionInput, parseApproveInput } from "../validation";

describe("validation helpers", () => {
  const base = { name: "Acme", city: "melbourne", addressOrBuilding: "123 Lane" };

  it("rejects empty name", () => {
    const r = parseSuggestionInput({ ...base, name: "" });
    expect(r.ok).toBe(false);
  });

  it("rejects bad city", () => {
    const r = parseSuggestionInput({ ...base, city: "not-a-city" });
    expect(r.ok).toBe(false);
  });

  it("accepts valid suggestion", () => {
    const r = parseSuggestionInput(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.name).toBe(base.name);
  });

  it("approve requires finite lat/lng", () => {
    expect(parseApproveInput({ lat: 1, lng: Infinity }).ok).toBe(false);
    expect(parseApproveInput({ lat: 1, lng: 2 }).ok).toBe(true);
  });
});

