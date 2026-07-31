"use client";

import dynamic from "next/dynamic";
import type { CitySlug, MapMarker, Startup } from "@/lib/types";

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
}: {
  city: CitySlug;
  startups: Startup[];
  markers: MapMarker[];
}) {
  return <StartupMap city={city} startups={startups} markers={markers} />;
}
