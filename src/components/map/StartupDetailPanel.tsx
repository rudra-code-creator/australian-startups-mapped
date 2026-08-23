"use client";

import * as React from "react";
import type { Startup } from "@/lib/types";
import { LogoImage } from "./LogoImage";

export function StartupDetailPanel({
  startup,
  onClose,
  onReportLocation,
}: {
  startup: Startup | null;
  onClose: () => void;
  onReportLocation?: (startup: Startup) => void;
}) {
  const open = Boolean(startup);
  const [failedImages, setFailedImages] = React.useState<Record<string, true>>(
    {},
  );

  React.useEffect(() => {
    setFailedImages({});
  }, [startup?.id]);

  const images = (startup?.imageUrls ?? []).filter((url) => !failedImages[url]);

  return (
    <aside
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        bottom: 16,
        width: "min(420px, calc(100vw - 32px))",
        transform: open ? "translateX(0)" : "translateX(calc(100% + 24px))",
        transition:
          "transform 240ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 200ms ease-out",
        opacity: open ? 1 : 0,
        borderRadius: 22,
        background: "var(--surface)",
        backdropFilter: "blur(14px)",
        border: "1px solid var(--border)",
        boxShadow: "var(--map-shadow), var(--glow-soft)",
        zIndex: 1200,
        overflow: "hidden",
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[color:var(--border-subtle)] flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            {startup ? <LogoImage startup={startup} size={48} /> : null}
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-[0.28em] uppercase text-[color:var(--muted)]">
                {startup?.sector ?? "Startup"}
              </div>
              <div className="text-xl font-semibold text-[color:var(--ink)] truncate">
                {startup?.name ?? ""}
              </div>
              {startup?.fundingStage ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: "var(--teal-dim)",
                      color: "var(--teal-deep)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {startup.fundingStage}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold rounded-full px-3 py-1 border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)]"
            aria-label="Close details"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          {startup?.blurb ? (
            <p className="text-sm leading-6 text-[color:var(--ink)]">
              {startup.blurb}
            </p>
          ) : (
            <p className="text-sm leading-6 text-[color:var(--muted)]">
              No description yet.
            </p>
          )}

          {startup?.fundingStage ? (
            <div className="space-y-1">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted)]">
                Funding
              </div>
              <p className="text-sm leading-6 text-[color:var(--ink)]">
                Latest stage (curated / illustrative):{" "}
                <span className="font-semibold">{startup.fundingStage}</span>
              </p>
            </div>
          ) : null}

          <div className="space-y-1">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted)]">
              Address
            </div>
            <p className="text-sm leading-6 text-[color:var(--ink)]">
              {startup?.address ||
                startup?.buildingName ||
                "Address being verified"}
            </p>
            {startup?.buildingName && startup?.address ? (
              <p className="text-xs text-[color:var(--muted)]">
                Hub: {startup.buildingName}
              </p>
            ) : null}
          </div>

          {images.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-[color:var(--muted)]">
                Snapshot
              </div>
              <div className="space-y-3">
                {images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`${startup?.name ?? "Startup"} preview`}
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      border: "1px solid var(--border-subtle)",
                      background: "var(--paper-2)",
                      display: "block",
                      minHeight: 160,
                      objectFit: "cover",
                    }}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [url]: true }))
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            {startup?.website ? (
              <a
                href={startup.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: "var(--teal-dim)",
                  color: "var(--teal-deep)",
                  border: "1px solid var(--border)",
                }}
              >
                Visit website
              </a>
            ) : null}
            {startup?.address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${startup.name} ${startup.address}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)]"
              >
                Open in Google Maps
              </a>
            ) : null}
            {startup && onReportLocation ? (
              <button
                onClick={() => onReportLocation(startup)}
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-hover)]"
              >
                Location looks wrong
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
