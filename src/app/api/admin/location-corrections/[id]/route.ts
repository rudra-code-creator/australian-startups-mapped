import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

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

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action } = parsed.data;

  try {
    await prisma.locationCorrection.update({
      where: { id },
      data: { status: action === "approve" ? "approved" : "rejected" },
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: "Location correction not found" }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true, status: action === "approve" ? "approved" : "rejected" });
}

