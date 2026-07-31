import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type AdminSessionData = {
  authenticated?: true;
};

const cookieName = "asm_admin";

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new Error("SESSION_SECRET is required");
  }

  return {
    cookieName,
    password,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<AdminSessionData>(cookies(), sessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();
  if (session.authenticated !== true) {
    return { ok: false as const };
  }
  return { ok: true as const, session };
}

export function loginWithPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const hashPassword = createHash("sha256").update(password).digest();
  const hashExpected = createHash("sha256").update(expected).digest();

  return timingSafeEqual(hashPassword, hashExpected);
}

