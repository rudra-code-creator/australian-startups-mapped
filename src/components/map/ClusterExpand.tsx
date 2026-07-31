"use client";

import * as React from "react";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import type { Startup } from "@/lib/types";
import { LogoImage } from "./LogoImage";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function LogoTile({
  startup,
  onSelect,
}: {
  startup: Startup;
  onSelect: (startup: Startup) => void;
}) {
  const size = 42;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(startup);
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
      }}
      className="rounded-full focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
      style={{
        width: size,
        height: size,
        boxShadow: "var(--map-shadow)",
        background: "white",
        overflow: "hidden",
        cursor: "pointer",
      }}
      aria-label={`Open ${startup.name}`}
      title={startup.name}
    >
      <LogoImage startup={startup} size={size} />
    </button>
  );
}

export function ClusterExpand({
  lat,
  lng,
  buildingName,
  startups,
  onSelect,
  onClose,
}: {
  lat: number;
  lng: number;
  buildingName: string;
  startups: Startup[];
  onSelect: (startup: Startup) => void;
  onClose: () => void;
}) {
  const map = useMap();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [bump, setBump] = React.useState(0);

  useMapEvents({
    move: () => setBump((x) => x + 1),
    zoom: () => setBump((x) => x + 1),
  });

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const { left, top } = React.useMemo(() => {
    const point = map.latLngToContainerPoint([lat, lng]);
    const size = map.getSize();
    const panelW = 280;
    const panelH = 240;
    const pad = 12;

    const rawLeft = point.x - panelW / 2;
    const rawTop = point.y - panelH - 18;

    return {
      left: clamp(rawLeft, pad, Math.max(pad, size.x - panelW - pad)),
      top: clamp(rawTop, pad, Math.max(pad, size.y - panelH - pad)),
    };
  }, [map, lat, lng, bump]);

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        left,
        top,
        width: 280,
        background: "white",
        borderRadius: 18,
        border: "1px solid rgba(15, 107, 107, 0.14)",
        boxShadow: "var(--map-shadow)",
        padding: 12,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
      className="cluster-expand-panel"
      role="dialog"
      aria-label={`${buildingName} hub`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[color:var(--ink)] truncate">
            {buildingName}
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            {startups.length} startups · tap a logo for details
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="text-xs font-semibold rounded-full px-2 py-1 border border-slate-200 hover:bg-slate-50"
          aria-label="Close"
        >
          Close
        </button>
      </div>

      <div
        className="mt-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {startups.slice(0, 25).map((s) => (
          <LogoTile key={s.id} startup={s} onSelect={onSelect} />
        ))}
      </div>

      {startups.length > 25 ? (
        <div className="mt-3 text-[11px] text-[color:var(--muted)]">
          Showing first 25.
        </div>
      ) : null}
    </div>
  );
}
