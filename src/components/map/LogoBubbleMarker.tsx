"use client";

import * as React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import type { Startup } from "@/lib/types";

const SIZE = 56;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

function buildLogoHtml({
  name,
  logoUrl,
  isActive,
}: {
  name: string;
  logoUrl?: string;
  isActive?: boolean;
}) {
  const initials = escapeHtml(initialsFromName(name));
  const title = escapeHtml(name);
  const border = isActive ? "2px solid var(--teal-deep)" : "2px solid white";
  const shell =
    `width:${SIZE}px;height:${SIZE}px;border-radius:9999px;` +
    `box-shadow:var(--map-shadow);overflow:hidden;` +
    `background:white;border:${border};display:grid;place-items:center;`;

  if (!logoUrl) {
    return `<div title="${title}" style="${shell}"><div data-init style="width:${SIZE}px;height:${SIZE}px;display:grid;place-items:center;background:var(--teal);color:white;font-weight:700;letter-spacing:0.06em;">${initials}</div></div>`;
  }

  const safeUrl = escapeHtml(logoUrl);
  const onError =
    "this.style.display='none';var el=this.parentElement&&this.parentElement.querySelector('[data-init]');if(el){el.style.display='grid';}";

  return (
    `<div title="${title}" style="${shell}">` +
    `<img alt="" src="${safeUrl}" style="width:${SIZE}px;height:${SIZE}px;object-fit:cover;border-radius:9999px;" onerror="${onError}"/>` +
    `<div data-init style="width:${SIZE}px;height:${SIZE}px;display:none;place-items:center;background:var(--teal);color:white;font-weight:700;letter-spacing:0.06em;">${initials}</div>` +
    `</div>`
  );
}

export function LogoBubbleMarker({
  startup,
  isActive,
  onClick,
}: {
  startup: Startup;
  isActive?: boolean;
  onClick: (startup: Startup) => void;
}) {
  const icon = React.useMemo(() => {
    const html = buildLogoHtml({
      name: startup.name,
      logoUrl: startup.logoUrl,
      isActive,
    });
    return L.divIcon({
      html,
      iconSize: [SIZE, SIZE],
      iconAnchor: [SIZE / 2, SIZE / 2],
      className: "",
    });
  }, [startup.name, startup.logoUrl, isActive]);

  return (
    <Marker
      position={[startup.lat, startup.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(startup) }}
    />
  );
}

