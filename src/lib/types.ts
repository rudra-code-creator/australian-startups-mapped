export type CitySlug =
  | "brisbane"
  | "sydney"
  | "melbourne"
  | "adelaide"
  | "perth"
  | "auckland"
  | "wellington"
  | "christchurch"
  | "port-moresby"
  | "suva"
  | "nadi"
  | "noumea"
  | "port-vila"
  | "honiara"
  | "jakarta"
  | "surabaya"
  | "bandung"
  | "yogyakarta"
  | "denpasar"
  | "medan"
  | "batam"
  | "johor-bahru"
  | "malacca"
  | "klang-valley"
  | "ipoh"
  | "penang"
  | "kuantan"
  | "kuching"
  | "kota-kinabalu"
  | "singapore"
  | "delhi-ncr"
  | "mumbai"
  | "pune"
  | "bangalore"
  | "hyderabad"
  | "chennai"
  | "kolkata"
  | "hong-kong"
  | "shenzhen"
  | "dongguan"
  | "guangzhou"
  | "zhuhai";

export type CountryId =
  | "australia"
  | "new-zealand"
  | "papua-new-guinea"
  | "fiji"
  | "new-caledonia"
  | "vanuatu"
  | "solomon-islands"
  | "indonesia"
  | "malaysia"
  | "singapore"
  | "india"
  | "greater-bay-area";

/** Curated / illustrative latest known funding stage for map labels. */
export type FundingStage =
  | "Pre-seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Series C"
  | "Series D+"
  | "Growth"
  | "Public"
  | "Bootstrapped";

export const FUNDING_STAGES: FundingStage[] = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Growth",
  "Public",
  "Bootstrapped",
];

export type Startup = {
  id: string;
  name: string;
  city: CitySlug;
  lat: number;
  lng: number;
  logoUrl?: string;
  website?: string;
  blurb?: string;
  address?: string;
  imageUrls?: string[];
  buildingId?: string;
  buildingName?: string;
  sector?: string;
  fundingStage?: FundingStage;
};

export type Building = {
  id: string;
  name: string;
  city: CitySlug;
  lat: number;
  lng: number;
};

export type MapMarker =
  | { kind: "single"; startup: Startup }
  | {
      kind: "hub";
      buildingId: string;
      buildingName: string;
      lat: number;
      lng: number;
      startups: Startup[];
    };

export type SuggestionStatus = "pending" | "approved" | "rejected";

export type LocationTargetKind = "startup" | "building";

export type LocationCorrectionStatus = "pending" | "approved" | "rejected";

export type LocationCorrectionInput = {
  targetKind: LocationTargetKind;
  targetId: string;
  city: CitySlug;
  name: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  clearBuildingId?: boolean;
  submitterNote?: string;
};
