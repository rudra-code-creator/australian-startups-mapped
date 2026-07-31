"use client";

import * as React from "react";
import type { Startup } from "@/lib/types";
import { InitialsAvatar } from "./InitialsAvatar";

export function StartupDetailPanel({
  startup,
  onClose,
}: {
  startup: Startup | null;
  onClose: () => void;
}) {
  const open = Boolean(startup);
  const [logoOk, setLogoOk] = React.useState(true);

  React.useEffect(() => {
    setLogoOk(true);
  }, [startup?.id]);

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
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(15, 107, 107, 0.14)",
        boxShadow: "var(--map-shadow)",
        zIndex: 1200,
        overflow: "hidden",
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200/70 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.28em] uppercase text-[color:var(--muted)]">
              Startup
            </div>
            <div className="text-xl font-semibold text-[color:var(--ink)] truncate">
              {startup?.name ?? ""}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold rounded-full px-3 py-1 border border-slate-200 hover:bg-slate-50"
            aria-label="Close details"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          <div className="flex items-center gap-3">
            {startup?.logoUrl && logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={startup.logoUrl}
                alt=""
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  objectFit: "cover",
                  boxShadow: "var(--map-shadow)",
                }}
                onError={() => setLogoOk(false)}
              />
            ) : null}
            <InitialsAvatar
              name={startup?.name ?? "Startup"}
              size={56}
              className={startup?.logoUrl && logoOk ? "hidden" : undefined}
            />
            <div className="min-w-0">
              {startup?.buildingName ? (
                <div className="text-sm font-semibold text-[color:var(--ink)] truncate">
                  {startup.buildingName}
                </div>
              ) : (
                <div className="text-sm text-[color:var(--muted)]">Office</div>
              )}
              <div className="text-xs text-[color:var(--muted)]">
                {startup?.sector ?? "Curated listing"}
              </div>
            </div>
          </div>

          {startup?.blurb ? (
            <p className="text-sm leading-6 text-[color:var(--ink)]">
              {startup.blurb}
            </p>
          ) : (
            <p className="text-sm leading-6 text-[color:var(--muted)]">
              No description yet.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {startup?.website ? (
              <a
                href={startup.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(15, 107, 107, 0.10)",
                  color: "var(--teal-deep)",
                  border: "1px solid rgba(15, 107, 107, 0.18)",
                }}
              >
                Visit website
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (!startup) return;
                const text = `${startup.name} (${startup.city})`;
                void navigator.clipboard?.writeText(text);
              }}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 hover:bg-slate-50"
            >
              Copy name
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

