"use client";

import * as React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { logoCandidates } from "@/lib/branding";
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

function buildLogoHtml({
  name,
  candidates,
  isActive,
}: {
  name: string;
  candidates: string[];
  isActive?: boolean;
}) {
  const initials = escapeHtml(initialsFromName(name));
  const title = escapeHtml(name);
  const border = isActive ? "2px solid var(--teal-deep)" : "2px solid white";
  const shell =
    `width:${SIZE}px;height:${SIZE}px;border-radius:9999px;` +
    `box-shadow:var(--map-shadow);overflow:hidden;` +
    `background:white;border:${border};display:grid;place-items:center;`;

  const initDiv =
    `<div data-init style="width:${SIZE}px;height:${SIZE}px;display:${candidates.length ? "none" : "grid"};place-items:center;background:linear-gradient(145deg, rgba(15,107,107,0.16), rgba(12,27,36,0.08));color:var(--teal-deep);font-weight:700;letter-spacing:0.04em;border:1px solid rgba(15,107,107,0.22);box-sizing:border-box;border-radius:9999px;">${initials}</div>`;

  if (!candidates.length) {
    return `<div title="${title}" style="${shell}">${initDiv}</div>`;
  }

  const encoded = candidates.map((u) => escapeHtml(u));
  const chain = JSON.stringify(encoded).replaceAll("'", "\\'");
  const onError =
    "var list=JSON.parse(this.dataset.fallbacks||'[]');var i=Number(this.dataset.i||0)+1;if(i<list.length){this.dataset.i=String(i);this.src=list[i];}else{this.style.display='none';var el=this.parentElement&&this.parentElement.querySelector('[data-init]');if(el){el.style.display='grid';}}";

  return (
    `<div title="${title}" style="${shell}">` +
    `<img alt="" data-i="0" data-fallbacks='${chain}' src="${encoded[0]}" style="width:${SIZE}px;height:${SIZE}px;object-fit:contain;padding:6px;box-sizing:border-box;border-radius:9999px;background:white;" onerror="${onError}"/>` +
    initDiv +
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
      candidates: logoCandidates(startup),
      isActive,
    });
    return L.divIcon({
      html,
      iconSize: [SIZE, SIZE],
      iconAnchor: [SIZE / 2, SIZE / 2],
      className: "",
    });
  }, [startup, isActive]);

  return (
    <Marker
      position={[startup.lat, startup.lng]}
      icon={icon}
      eventHandlers={{ click: () => onClick(startup) }}
    />
  );
}
