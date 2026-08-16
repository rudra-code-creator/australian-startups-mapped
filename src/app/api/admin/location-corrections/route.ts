import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.locationCorrection.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(rows);
}

