import { NextResponse } from "next/server";
import { getSession, loginWithCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as { username?: unknown; password?: unknown } | null;
  const username = record?.username;
  const password = record?.password;

  if (typeof username !== "string" || username.trim().length === 0) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (typeof password !== "string") {
    return NextResponse.json({ error: "password is required" }, { status: 400 });
  }

  if (!loginWithCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const session = await getSession();
  session.authenticated = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
