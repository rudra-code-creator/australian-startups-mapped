import type { CitySlug } from "./types";

export const CITY_SLUGS: CitySlug[] = [
  "brisbane",
  "sydney",
  "melbourne",
  "adelaide",
  "perth",
];

export const CITIES: Record<
  CitySlug,
  { name: string; center: [number, number]; zoom: number }
> = {
  brisbane: { name: "Brisbane", center: [-27.4698, 153.0251], zoom: 13 },
  sydney: { name: "Sydney", center: [-33.8688, 151.2093], zoom: 13 },
  melbourne: { name: "Melbourne", center: [-37.8136, 144.9631], zoom: 13 },
  adelaide: { name: "Adelaide", center: [-34.9285, 138.6007], zoom: 13 },
  perth: { name: "Perth", center: [-31.9523, 115.8613], zoom: 13 },
};

export function isCitySlug(value: string): value is CitySlug {
  return (CITY_SLUGS as string[]).includes(value);
}

