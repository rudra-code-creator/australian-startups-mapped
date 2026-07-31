import { NextResponse } from "next/server";
import { getSession, loginWithPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = (body as { password?: unknown } | null)?.password;
  if (typeof password !== "string") {
    return NextResponse.json({ error: "password is required" }, { status: 400 });
  }

  if (!loginWithPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const session = await getSession();
  session.authenticated = true;
  await session.save();

  return NextResponse.json({ ok: true });
}

