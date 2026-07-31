import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { isCitySlug } from "@/lib/cities";
import { loadBuildings, loadSeedStartups } from "@/lib/load-seed";
import { groupMarkers } from "@/lib/group-markers";
import type { CitySlug } from "@/lib/types";

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

export default async function CityMapPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!isCitySlug(city)) notFound();

  const startups = loadSeedStartups(city);
  const buildings = loadBuildings().filter((b) => b.city === city);
  const markers = groupMarkers(startups, buildings);

  return (
    <main className="min-h-screen">
      <StartupMap
        city={city as CitySlug}
        startups={startups}
        markers={markers}
      />
    </main>
  );
}

