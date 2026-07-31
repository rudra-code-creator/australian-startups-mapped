import type { Startup } from "./types";

function keyOf(s: Startup): string {
  return `${s.city}::${s.name.trim().toLowerCase()}`;
}

export function mergeStartups(seed: Startup[], approved: Startup[]): Startup[] {
  const byKey = new Map<string, Startup>();
  const idToKey = new Map<string, string>();

  for (const s of seed) {
    const k = keyOf(s);
    byKey.set(k, s);
    if (s.id) idToKey.set(s.id, k);
  }

  for (const a of approved) {
    if (a.id && idToKey.has(a.id)) {
      // approved matches an existing seed by id — replace it.
      const oldKey = idToKey.get(a.id)!;
      // remove old key if different (handles name/city change)
      if (oldKey !== keyOf(a)) byKey.delete(oldKey);
      const newKey = keyOf(a);
      byKey.set(newKey, a);
      idToKey.set(a.id, newKey);
      continue;
    }

    const k = keyOf(a);
    // If normalized name+city already exists (different id), skip approved.
    if (byKey.has(k)) continue;
    // otherwise insert approved
    byKey.set(k, a);
    if (a.id) idToKey.set(a.id, k);
  }

  return Array.from(byKey.values());
}

