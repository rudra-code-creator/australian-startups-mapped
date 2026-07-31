import type { Building, CitySlug, Startup } from "./types";
import { enrichStartupPresentation } from "./branding";
import buildings from "@/data/buildings.json";
import brisbane from "@/data/startups/brisbane.json";
import sydney from "@/data/startups/sydney.json";
import melbourne from "@/data/startups/melbourne.json";
import adelaide from "@/data/startups/adelaide.json";
import perth from "@/data/startups/perth.json";

const SEED: Record<CitySlug, Startup[]> = {
  brisbane: brisbane as Startup[],
  sydney: sydney as Startup[],
  melbourne: melbourne as Startup[],
  adelaide: adelaide as Startup[],
  perth: perth as Startup[],
};

export function loadBuildings(): Building[] {
  return buildings as Building[];
}

export function loadSeedStartups(city: CitySlug): Startup[] {
  return (SEED[city] ?? []).map(enrichStartupPresentation);
}

