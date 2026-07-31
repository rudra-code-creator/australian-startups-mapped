import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.suggestion.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ suggestions: rows });
}

