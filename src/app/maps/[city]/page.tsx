import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isCitySlug } from "@/lib/cities";
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

type StartupsApiResponse = {
  city: CitySlug;
  startups: Startup[];
  buildings: Building[];
  markers: MapMarker[];
  count: number;
};

async function fetchCityMapData(city: CitySlug): Promise<StartupsApiResponse> {
  const h = await headers();
  const host = h.get("host");
  if (!host) {
    throw new Error("Missing host header for city map fetch");
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/startups/${city}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to load startups for ${city}`);
  }
  return (await res.json()) as StartupsApiResponse;
}

export default async function CityMapPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isCitySlug(city)) notFound();

  const data = await fetchCityMapData(city);

  return (
    <main className="min-h-screen">
      <StartupMap
        city={city}
        startups={data.startups}
        markers={data.markers}
      />
    </main>
  );
}

