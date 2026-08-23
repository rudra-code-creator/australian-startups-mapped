"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES, COUNTRIES, chromeRegionLabel, chromeSiblings } from "@/lib/cities";
import type { CitySlug } from "@/lib/types";

export function CityChrome({
  city,
  totalCount,
  visibleCount,
  search,
  onSearchChange,
  isAdmin,
  fixLocations,
  onToggleFixLocations,
}: {
  city: CitySlug;
  totalCount: number;
  visibleCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  isAdmin?: boolean;
  fixLocations?: boolean;
  onToggleFixLocations?: () => void;
}) {
  const router = useRouter();
  const siblings = chromeSiblings(city);
  const regionLabel = chromeRegionLabel(city);

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: 16,
        right: 16,
        zIndex: 1100,
        pointerEvents: "none",
      }}
    >
      <div
        className="mx-auto shell-bar"
        style={{
          maxWidth: 1100,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: 22,
          padding: "12px 14px",
          pointerEvents: "auto",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block min-w-0">
            <div className="text-xs font-semibold tracking-[0.28em] uppercase text-[color:var(--muted)]">
              {regionLabel}
            </div>
            <div className="text-lg font-semibold text-[color:var(--ink)] truncate">
              {CITIES[city].name}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {siblings.length > 1
              ? siblings.map((slug) => {
                  const active = slug === city;
                  return (
                    <Link
                      key={slug}
                      href={`/maps/${slug}`}
                      className="ui-chip text-xs font-semibold rounded-full px-3 py-1 border transition-colors"
                      data-active={active ? "true" : "false"}
                    >
                      {CITIES[slug].name}
                    </Link>
                  );
                })
              : null}

            <label className="sr-only" htmlFor="city-switcher">
              Jump to another city
            </label>
            <select
              id="city-switcher"
              value={city}
              onChange={(event) => router.push(`/maps/${event.target.value}`)}
              className="ui-input text-xs font-semibold rounded-full border px-3 py-1 outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
            >
              {COUNTRIES.map((item) => (
                <optgroup key={item.id} label={item.name}>
                  {item.citySlugs.map((slug) => (
                    <option key={slug} value={slug}>
                      {CITIES[slug].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={onToggleFixLocations}
              style={{
                padding: "6px 12px",
                backgroundColor: fixLocations ? "var(--teal)" : "var(--surface)",
                border: "1px solid",
                borderColor: fixLocations ? "var(--teal)" : "var(--border-subtle)",
                borderRadius: "16px",
                color: fixLocations ? "var(--paper)" : "var(--ink)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {fixLocations ? "Exit Fix Mode" : "Fix Locations"}
            </button>
          )}

          <div className="hidden md:block text-xs text-[color:var(--muted)]">
            {visibleCount} / {totalCount}
          </div>
          <label className="sr-only" htmlFor="map-search">
            Search
          </label>
          <input
            id="map-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search startups…"
            className="ui-input text-sm px-4 py-2 rounded-full border outline-none focus:ring-2 focus:ring-[color:var(--teal)] w-[min(280px,40vw)]"
          />
        </div>
      </div>

      <div className="mt-2 mx-auto" style={{ maxWidth: 1100 }}>
        <div
          className="text-[11px] text-[color:var(--muted)]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 9999,
            padding: "6px 12px",
            width: "fit-content",
            pointerEvents: "auto",
            backdropFilter: "blur(10px)",
          }}
        >
          {CITIES[city].note
            ? `${CITIES[city].note}. Curated / illustrative — not a complete census.`
            : "Curated / illustrative — not a complete census."}
        </div>
      </div>
    </div>
  );
}
