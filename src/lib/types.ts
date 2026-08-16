export type CitySlug = "brisbane" | "sydney" | "melbourne" | "adelaide" | "perth";

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

