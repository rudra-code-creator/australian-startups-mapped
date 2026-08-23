'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { CITIES, COUNTRIES } from "@/lib/cities";
import type {
  CitySlug,
  LocationCorrectionStatus,
  LocationTargetKind,
} from "@/lib/types";

type LocationCorrectionRow = {
  id: string;
  city: CitySlug;
  name: string;
  targetKind: LocationTargetKind;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  clearBuildingId: boolean;
  submitterNote: string | null;
  status: LocationCorrectionStatus;
  createdAt: string;
};

function formatLatLng(lat: number, lng: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return `${lat}, ${lng}`;
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function getFilenameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename=\"?([^\";]+)\"?/i.exec(disposition);
  return match?.[1] ?? fallback;
}

export function LocationFixesQueue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LocationCorrectionRow[]>([]);
  const [selectedCity, setSelectedCity] = useState<CitySlug>("brisbane");
  const [downloading, setDownloading] = useState(false);

  const pendingCount = useMemo(() => rows.length, [rows.length]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/location-corrections", { method: "GET" });
      if (res.status === 401) {
        setRows([]);
        setError("Unauthorized. Please sign in to view location fixes.");
        return;
      }
      if (!res.ok) {
        setError("Failed to load location fixes");
        return;
      }
      const json = (await res.json()) as LocationCorrectionRow[];
      setRows(json ?? []);
    } catch {
      setError("Failed to load location fixes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function updateStatus(id: string, action: "approve" | "reject") {
    setError(null);
    const res = await fetch(`/api/admin/location-corrections/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? (action === "approve" ? "Approve failed" : "Reject failed"));
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function downloadMergedSeed() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/seed-export/${selectedCity}`, {
        method: "GET",
      });
      if (res.status === 401) {
        setError("Unauthorized. Please sign in to download merged seed.");
        return;
      }
      if (!res.ok) {
        setError("Failed to download merged seed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const filename = getFilenameFromDisposition(
        disposition,
        `${selectedCity}-merged-seed.json`,
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download merged seed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--muted)]">
          {loading ? "Loading…" : `${pendingCount} pending`}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] px-3 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] p-4 text-sm shadow-sm">
        <div>
          <div className="text-xs font-medium text-black/70">City</div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value as CitySlug)}
            className="mt-1 w-48 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] px-3 py-2 text-sm outline-none focus:border-black/30"
          >
            {COUNTRIES.map((country) => (
              <optgroup key={country.id} label={country.name}>
                {country.citySlugs.map((slug) => (
                  <option key={slug} value={slug}>
                    {CITIES[slug].name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void downloadMergedSeed()}
          className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {downloading ? "Downloading…" : "Download merged seed"}
        </button>
        <p className="text-xs text-[color:var(--muted)]">
          Applies all approved location fixes to the current seed for the selected city.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-[260px]">
                <div className="text-base font-semibold leading-tight">{row.name}</div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {CITIES[row.city].name} ·{" "}
                  {row.targetKind === "startup" ? "Startup" : "Building"}
                </div>
                <div className="mt-2 text-xs text-black/70">
                  <div>
                    <span className="font-medium">From:</span>{" "}
                    {formatLatLng(row.fromLat, row.fromLng)}
                  </div>
                  <div>
                    <span className="font-medium">To:</span>{" "}
                    {formatLatLng(row.toLat, row.toLng)}
                  </div>
                  {row.clearBuildingId ? (
                    <div className="mt-1">
                      <span className="font-medium">Building:</span> Clear building association
                    </div>
                  ) : null}
                </div>
                {row.submitterNote ? (
                  <p className="mt-3 text-sm text-black/80">{row.submitterNote}</p>
                ) : null}
                <div className="mt-2 text-xs text-[color:var(--muted)]">
                  Reported at {new Date(row.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void updateStatus(row.id, "reject")}
                  className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] px-3 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => void updateStatus(row.id, "approve")}
                  className="rounded-lg bg-[color:var(--accent)] px-3 py-2 text-sm font-medium text-white"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && rows.length === 0 ? (
          <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-solid)] p-8 text-center text-sm text-[color:var(--muted)]">
            No pending location fixes.
          </div>
        ) : null}
      </div>
    </section>
  );
}

