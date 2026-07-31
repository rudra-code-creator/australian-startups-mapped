import { notFound } from "next/navigation";
import { CityMapClient } from "@/components/map/CityMapClient";
import { getCityMapData } from "@/lib/get-city-map-data";

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
      <CityMapClient
        city={data.city}
        startups={data.startups}
        markers={data.markers}
      />
    </main>
  );
}
