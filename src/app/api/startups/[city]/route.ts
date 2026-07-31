import { NextResponse } from "next/server";
import { getCityMapData } from "@/lib/get-city-map-data";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ city: string }> },
) {
  const { city } = await ctx.params;
  const data = await getCityMapData(city);
  if (!data) {
    return NextResponse.json({ error: "Unknown city" }, { status: 404 });
  }

  return NextResponse.json(data);
}

