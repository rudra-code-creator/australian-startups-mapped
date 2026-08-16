import { z } from "zod";
import { isCitySlug } from "@/lib/cities";
import type { LocationCorrectionInput } from "./types";

export type SuggestionInput = {
  name: string;
  city: string;
  addressOrBuilding: string;
  website?: string;
  logoUrl?: string;
  email?: string;
  blurb?: string;
  sector?: string;
};

const suggestionSchema = z.object({
  name: z.string().min(1, "name is required"),
  city: z.string().refine((v) => isCitySlug(v), "invalid city"),
  addressOrBuilding: z.string().min(1, "address or building is required"),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  blurb: z.string().optional(),
  sector: z.string().optional(),
});

const approveSchema = z.object({
  lat: z.number().refine((n) => Number.isFinite(n), "lat must be finite"),
  lng: z.number().refine((n) => Number.isFinite(n), "lng must be finite"),
  buildingId: z.string().optional(),
  buildingName: z.string().optional(),
  blurb: z.string().optional(),
});

const locationCorrectionSchema = z.object({
  targetKind: z.enum(["startup", "building"]),
  targetId: z.string().min(1, "targetId is required"),
  city: z.string().refine((v) => isCitySlug(v), "invalid city"),
  name: z.string().min(1, "name is required"),
  fromLat: z.number().refine((n) => Number.isFinite(n), "fromLat must be finite"),
  fromLng: z.number().refine((n) => Number.isFinite(n), "fromLng must be finite"),
  toLat: z.number().refine((n) => Number.isFinite(n), "toLat must be finite"),
  toLng: z.number().refine((n) => Number.isFinite(n), "toLng must be finite"),
  clearBuildingId: z.boolean().optional(),
  submitterNote: z.string().max(500, "submitterNote too long").optional(),
});

export function parseSuggestionInput(
  body: unknown
): { ok: true; data: SuggestionInput } | { ok: false; error: string } {
  const res = suggestionSchema.safeParse(body);
  if (!res.success) return { ok: false, error: res.error.message };
  return { ok: true, data: res.data as SuggestionInput };
}

export function parseApproveInput(
  body: unknown
): { ok: true; data: z.infer<typeof approveSchema> } | { ok: false; error: string } {
  const res = approveSchema.safeParse(body);
  if (!res.success) return { ok: false, error: res.error.message };
  return { ok: true, data: res.data };
}

export function parseLocationCorrectionInput(
  body: unknown
):
  | { ok: true; data: LocationCorrectionInput }
  | { ok: false; error: string } {
  const res = locationCorrectionSchema.safeParse(body);
  if (!res.success) return { ok: false, error: res.error.message };
  return { ok: true, data: res.data as LocationCorrectionInput };
}


