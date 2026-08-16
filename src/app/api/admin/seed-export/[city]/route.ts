import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isCitySlug } from "@/lib/cities";
import { applyLocationCorrections } from "@/lib/apply-location-corrections";
import { loadBuildings, loadSeedStartups } from "@/lib/load-seed";
import { buildMergedSeed } from "@/lib/build-merged-seed";
import type { CitySlug } from "@/lib/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ city: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { city: cityParam } = await ctx.params;
  if (!isCitySlug(cityParam)) {
    return NextResponse.json({ error: "Invalid city" }, { status: 400 });
  }

  const city: CitySlug = cityParam;

  const approvedCorrections = await prisma.locationCorrection.findMany({
    where: { status: "approved", city },
  });

  const seedStartups = loadSeedStartups(city);
  const seedBuildings = loadBuildings().filter((b) => b.city === city);

  const { startups, buildings } = applyLocationCorrections(
    seedStartups,
    seedBuildings,
    approvedCorrections,
  );

  const payload = buildMergedSeed(startups, buildings);
  const json = JSON.stringify(payload, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${city}-merged-seed.json"`,
    },
  });
}

