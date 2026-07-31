import { NextResponse } from "next/server";
import { isCitySlug } from "@/lib/cities";
import { loadBuildings, loadSeedStartups } from "@/lib/load-seed";
import { mergeStartups } from "@/lib/merge-startups";
import { groupMarkers } from "@/lib/group-markers";
import { prisma } from "@/lib/db";
import type { Startup } from "@/lib/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ city: string }> },
) {
  const { city } = await ctx.params;
  if (!isCitySlug(city)) {
    return NextResponse.json({ error: "Unknown city" }, { status: 404 });
  }

  const approvedRows = await prisma.suggestion.findMany({
    where: { status: "approved", city },
  });

  const approved: Startup[] = approvedRows
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({
      id: r.id,
      name: r.name,
      city: city,
      lat: r.lat as number,
      lng: r.lng as number,
      logoUrl: r.logoUrl ?? undefined,
      website: r.website ?? undefined,
      blurb: r.blurb ?? undefined,
      buildingId: r.buildingId ?? undefined,
      buildingName: r.buildingName ?? undefined,
      sector: r.sector ?? undefined,
    }));

  const startups = mergeStartups(loadSeedStartups(city), approved);
  const buildings = loadBuildings().filter((b) => b.city === city);
  const markers = groupMarkers(startups, buildings);

  return NextResponse.json({
    city,
    startups,
    buildings,
    markers,
    count: startups.length,
  });
}

