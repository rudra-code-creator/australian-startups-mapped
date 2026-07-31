import type { Startup } from "./types";

function keyOf(s: Startup): string {
  return `${s.city}::${s.name.trim().toLowerCase()}`;
}

export function mergeStartups(seed: Startup[], approved: Startup[]): Startup[] {
  const byKey = new Map<string, Startup>();
  for (const s of seed) byKey.set(keyOf(s), s);
  for (const s of approved) {
    const k = keyOf(s);
    if (byKey.has(k)) continue;
    byKey.set(k, s);
  }
  return Array.from(byKey.values());
}

