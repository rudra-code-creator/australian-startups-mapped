import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getCityMapData } from "@/lib/get-city-map-data";

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
  const data = await getCityMapData(city);

  if (!data) notFound();

  return (
    <main className="min-h-screen">
      <StartupMap city={data.city} startups={data.startups} markers={data.markers} />
    </main>
  );
}

