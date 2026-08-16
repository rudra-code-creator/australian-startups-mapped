import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isCitySlug } from "@/lib/cities";

function makeSeedWriteSchema(city: string) {
  const cityLiteral = z
    .string()
    .refine((value) => value === city, "city must match path");

  const startupSchema = z.object({
    id: z.string().min(1, "id is required"),
    name: z.string().min(1, "name is required"),
    city: cityLiteral,
    lat: z.number().finite(),
    lng: z.number().finite(),
    logoUrl: z.string().url().optional(),
    website: z.string().url().optional(),
    blurb: z.string().optional(),
    address: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    buildingId: z.string().optional(),
    buildingName: z.string().optional(),
    sector: z.string().optional(),
  });

  const buildingSchema = z.object({
    id: z.string().min(1, "id is required"),
    name: z.string().min(1, "name is required"),
    city: cityLiteral,
    lat: z.number().finite(),
    lng: z.number().finite(),
  });

  return z.object({
    startups: z.array(startupSchema).min(1, "startups is required"),
    buildings: z.array(buildingSchema).optional(),
  });
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ city: string }> },
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Write disabled in production" },
      { status: 403 },
    );
  }

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { city: cityParam } = await ctx.params;
  if (!isCitySlug(cityParam)) {
    return NextResponse.json({ error: "Invalid city" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const schema = makeSeedWriteSchema(cityParam);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.message },
      { status: 400 },
    );
  }

  const { startups, buildings } = parsed.data;

  const startupsDir = path.join(
    process.cwd(),
    "src",
    "data",
    "startups",
  );
  const startupsPath = path.join(startupsDir, `${cityParam}.json`);

  await fs.mkdir(startupsDir, { recursive: true });
  await fs.writeFile(
    startupsPath,
    JSON.stringify(startups, null, 2) + "\n",
    "utf8",
  );

  if (buildings && buildings.length > 0) {
    const buildingsPath = path.join(
      process.cwd(),
      "src",
      "data",
      "buildings.json",
    );

    let existing: unknown = [];
    try {
      const raw = await fs.readFile(buildingsPath, "utf8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    const existingArray = Array.isArray(existing) ? existing : [];
    const others = existingArray.filter(
      (b: { city?: string }) => b.city !== cityParam,
    );
    const merged = [...others, ...buildings];

    await fs.mkdir(path.dirname(buildingsPath), { recursive: true });
    await fs.writeFile(
      buildingsPath,
      JSON.stringify(merged, null, 2) + "\n",
      "utf8",
    );
  }

  return NextResponse.json({ ok: true });
}

