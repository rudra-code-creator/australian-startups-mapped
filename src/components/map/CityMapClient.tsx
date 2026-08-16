"use client";

import dynamic from "next/dynamic";
import type { Building, CitySlug, MapMarker, Startup } from "@/lib/types";

const StartupMap = dynamic(
  () => import("@/components/map/StartupMap").then((m) => m.StartupMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen grid place-items-center text-sm text-[color:var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export function CityMapClient({
  city,
  startups,
  markers,
  buildings,
  isAdmin,
  canWriteSeed,
}: {
  city: CitySlug;
  startups: Startup[];
  markers: MapMarker[];
  buildings: Building[];
  isAdmin: boolean;
  canWriteSeed: boolean;
}) {
  return (
    <StartupMap
      city={city}
      startups={startups}
      markers={markers}
      buildings={buildings}
      isAdmin={isAdmin}
      canWriteSeed={canWriteSeed}
    />
  );
}
