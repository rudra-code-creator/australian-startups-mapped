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
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, sessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();
  if (session.authenticated !== true) {
    return { ok: false as const };
  }
  return { ok: true as const, session };
}

function safeEqualString(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/** Default local username when ADMIN_USERNAME is unset. */
export const DEFAULT_ADMIN_USERNAME = "ADMIN";

export function loginWithCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser =
    process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;

  const userOk = safeEqualString(username.trim(), expectedUser);
  const passOk = safeEqualString(password, expectedPassword);
  return userOk && passOk;
}

/** @deprecated Prefer loginWithCredentials */
export function loginWithPassword(password: string): boolean {
  return loginWithCredentials(DEFAULT_ADMIN_USERNAME, password);
}

