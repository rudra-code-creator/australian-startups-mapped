import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseApproveInput } from "@/lib/validation";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = (body as { action?: unknown } | null)?.action;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "approve") {
    const parsed = parseApproveInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await prisma.suggestion.update({
      where: { id },
      data: {
        status: "approved",
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        buildingId: parsed.data.buildingId,
        buildingName: parsed.data.buildingName,
        blurb: parsed.data.blurb,
      },
    });

    return NextResponse.json({ ok: true, status: "approved" });
  }

  await prisma.suggestion.update({
    where: { id },
    data: { status: "rejected" },
  });

  return NextResponse.json({ ok: true, status: "rejected" });
}

