"use client";

import * as React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

const SIZE = 56;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHubHtml({
  label,
  count,
  isActive,
}: {
  label: string;
  count: number;
  isActive?: boolean;
}) {
  const title = escapeHtml(label);
  const border = isActive ? "2px solid var(--teal-deep)" : "2px solid white";
  const shell =
    `width:${SIZE}px;height:${SIZE}px;border-radius:9999px;` +
    `box-shadow:var(--map-shadow);overflow:hidden;` +
    `background:var(--teal);border:${border};display:grid;place-items:center;`;
  const text =
    "color:white;font-weight:800;letter-spacing:0.02em;" +
    "font-size:18px;line-height:1;";

  return `<div title="${title}" style="${shell}"><span style="${text}">${count}</span></div>`;
}

export function HubMarker({
  lat,
  lng,
  buildingName,
  count,
  isActive,
  onClick,
}: {
  lat: number;
  lng: number;
  buildingName: string;
  count: number;
  isActive?: boolean;
  onClick: () => void;
}) {
  const icon = React.useMemo(() => {
    const html = buildHubHtml({ label: buildingName, count, isActive });
    return L.divIcon({
      html,
      iconSize: [SIZE, SIZE],
      iconAnchor: [SIZE / 2, SIZE / 2],
      className: "",
    });
  }, [buildingName, count, isActive]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick() }}
    />
  );
}

