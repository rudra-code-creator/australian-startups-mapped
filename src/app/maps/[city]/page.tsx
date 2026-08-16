import { notFound } from "next/navigation";
import { CityMapClient } from "@/components/map/CityMapClient";
import { getCityMapData } from "@/lib/get-city-map-data";
import { getSession } from "@/lib/auth";

export default async function CityMapPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const data = await getCityMapData(city);

  if (!data) notFound();

  const session = await getSession();
  const isAdmin = session.authenticated === true;
  const canWriteSeed = process.env.NODE_ENV !== "production";

  return (
    <main className="min-h-screen">
      <CityMapClient
        city={data.city}
        startups={data.startups}
        markers={data.markers}
        buildings={data.buildings}
        isAdmin={isAdmin}
        canWriteSeed={canWriteSeed}
      />
    </main>
  );
}
