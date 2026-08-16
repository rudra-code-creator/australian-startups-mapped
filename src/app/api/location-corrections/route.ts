import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { metersBetween, MIN_CORRECTION_METERS } from "@/lib/geo";
import { parseLocationCorrectionInput } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseLocationCorrectionInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const d = parsed.data;
  const meters = metersBetween(
    { lat: d.fromLat, lng: d.fromLng },
    { lat: d.toLat, lng: d.toLng },
  );
  if (meters < MIN_CORRECTION_METERS) {
    return NextResponse.json(
      { error: `Move at least ${MIN_CORRECTION_METERS} meters` },
      { status: 400 },
    );
  }

  // Light rate limit: reject if >5 pending creates from same target in last 10 minutes
  const recent = await prisma.locationCorrection.count({
    where: {
      targetKind: d.targetKind,
      targetId: d.targetId,
      status: "pending",
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recent >= 5) {
    return NextResponse.json(
      { error: "Too many reports; try later" },
      { status: 429 },
    );
  }

  const row = await prisma.locationCorrection.create({
    data: {
      targetKind: d.targetKind,
      targetId: d.targetId,
      city: d.city,
      name: d.name,
      fromLat: d.fromLat,
      fromLng: d.fromLng,
      toLat: d.toLat,
      toLng: d.toLng,
      clearBuildingId: d.clearBuildingId ?? false,
      submitterNote: d.submitterNote,
      status: "pending",
    },
  });
  return NextResponse.json({ id: row.id }, { status: 201 });
}

