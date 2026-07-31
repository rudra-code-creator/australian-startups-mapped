"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoginForm } from "./LoginForm";

type PendingSuggestion = {
  id: string;
  name: string;
  city: string;
  addressOrBuilding: string;
  website: string | null;
  logoUrl: string | null;
  blurb: string | null;
  sector: string | null;
  submitterEmail: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
};

function toFiniteNumber(input: string): number | null {
  const n = Number.parseFloat(input);
  return Number.isFinite(n) ? n : null;
}

export function PendingQueue() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PendingSuggestion[]>([]);
  const [latLngById, setLatLngById] = useState<Record<string, { lat: string; lng: string }>>(
    {},
  );

  const initLatLng = useCallback((suggestions: PendingSuggestion[]) => {
    setLatLngById((prev) => {
      const next = { ...prev };
      for (const s of suggestions) {
        if (!next[s.id]) {
          next[s.id] = {
            lat: s.lat == null ? "" : String(s.lat),
            lng: s.lng == null ? "" : String(s.lng),
          };
        }
      }
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/suggestions", { method: "GET" });
      if (res.status === 401) {
        setAuthed(false);
        setRows([]);
        return;
      }
      if (!res.ok) {
        setError("Failed to load suggestions");
        return;
      }
      const json = (await res.json()) as { suggestions: PendingSuggestion[] };
      setAuthed(true);
      setRows(json.suggestions ?? []);
      initLatLng(json.suggestions ?? []);
    } catch {
      setError("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [initLatLng]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingCount = useMemo(() => rows.length, [rows.length]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthed(false);
    setRows([]);
  }

  async function approve(id: string) {
    const ll = latLngById[id];
    const lat = ll ? toFiniteNumber(ll.lat) : null;
    const lng = ll ? toFiniteNumber(ll.lng) : null;
    if (lat == null || lng == null) {
      setError("Approve requires finite lat and lng");
      return;
    }

    setError(null);
    const res = await fetch(`/api/admin/suggestions/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "approve", lat, lng }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Approve failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function reject(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/suggestions/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Reject failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (authed === false) {
    return <LoginForm onSuccess={refresh} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--muted)]">
          {loading ? "Loading…" : `${pendingCount} pending`}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
          >
            Logout
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

      <div className="grid gap-4">
        {rows.map((s) => (
          <div key={s.id} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-[260px]">
                <div className="text-base font-semibold leading-tight">{s.name}</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {s.city} · {s.addressOrBuilding}
                </div>
                {s.website ? (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-[color:var(--accent)] underline decoration-black/10 underline-offset-2"
                  >
                    {s.website}
                  </a>
                ) : null}
                {s.blurb ? <p className="mt-2 text-sm text-black/80">{s.blurb}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-black/70">Lat</label>
                    <input
                      value={latLngById[s.id]?.lat ?? ""}
                      onChange={(e) =>
                        setLatLngById((prev) => ({
                          ...prev,
                          [s.id]: { lat: e.target.value, lng: prev[s.id]?.lng ?? "" },
                        }))
                      }
                      inputMode="decimal"
                      className="mt-1 w-40 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                      placeholder="-27.47"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/70">Lng</label>
                    <input
                      value={latLngById[s.id]?.lng ?? ""}
                      onChange={(e) =>
                        setLatLngById((prev) => ({
                          ...prev,
                          [s.id]: { lat: prev[s.id]?.lat ?? "", lng: e.target.value },
                        }))
                      }
                      inputMode="decimal"
                      className="mt-1 w-40 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
                      placeholder="153.02"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => reject(s.id)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => approve(s.id)}
                    className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-white"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {authed === true && !loading && rows.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-[color:var(--muted)]">
            No pending suggestions.
          </div>
        ) : null}
      </div>
    </section>
  );
}

