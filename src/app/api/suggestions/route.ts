import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSuggestionInput } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSuggestionInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const row = await prisma.suggestion.create({
    data: {
      name: parsed.data.name,
      city: parsed.data.city,
      addressOrBuilding: parsed.data.addressOrBuilding,
      website: parsed.data.website,
      logoUrl: parsed.data.logoUrl,
      submitterEmail: parsed.data.email,
      blurb: parsed.data.blurb,
      sector: parsed.data.sector,
      status: "pending",
    },
  });

  return NextResponse.json({ id: row.id, status: "pending" }, { status: 201 });
}

