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
  fundingStage,
}: {
  name: string;
  candidates: string[];
  isActive?: boolean;
  fundingStage?: string;
}) {
  const initials = escapeHtml(initialsFromName(name));
  const title = escapeHtml(
    fundingStage ? `${name} · ${fundingStage}` : name,
  );
  const border = isActive ? "2px solid var(--teal-deep)" : "2px solid white";
  const shell =
    `width:${SIZE}px;height:${SIZE}px;border-radius:9999px;` +
    `box-shadow:var(--map-shadow);overflow:hidden;` +
    `background:white;border:${border};display:grid;place-items:center;`;

  const initDiv =
    `<div data-init style="width:${SIZE}px;height:${SIZE}px;display:${candidates.length ? "none" : "grid"};place-items:center;background:linear-gradient(145deg, rgba(15,107,107,0.16), rgba(12,27,36,0.08));color:var(--teal-deep);font-weight:700;letter-spacing:0.04em;border:1px solid rgba(15,107,107,0.22);box-sizing:border-box;border-radius:9999px;">${initials}</div>`;

  const badge = fundingStage
    ? `<div style="position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);white-space:nowrap;font-size:9px;font-weight:700;letter-spacing:0.02em;line-height:1;padding:2px 5px;border-radius:9999px;background:rgba(12,27,36,0.92);color:white;border:1px solid rgba(255,255,255,0.35);box-shadow:0 2px 6px rgba(12,27,36,0.25);">${escapeHtml(fundingStage)}</div>`
    : "";

  const wrap =
    `position:relative;width:${SIZE}px;height:${SIZE + (fundingStage ? 10 : 0)}px;`;

  if (!candidates.length) {
    return `<div title="${title}" style="${wrap}"><div style="${shell}">${initDiv}</div>${badge}</div>`;
  }

  const encoded = candidates.map((u) => escapeHtml(u));
  const chain = JSON.stringify(encoded).replaceAll("'", "\\'");
  const onError =
    "var list=JSON.parse(this.dataset.fallbacks||'[]');var i=Number(this.dataset.i||0)+1;if(i<list.length){this.dataset.i=String(i);this.src=list[i];}else{this.style.display='none';var el=this.parentElement&&this.parentElement.querySelector('[data-init]');if(el){el.style.display='grid';}}";

  return (
    `<div title="${title}" style="${wrap}">` +
    `<div style="${shell}">` +
    `<img alt="" data-i="0" data-fallbacks='${chain}' src="${encoded[0]}" style="width:${SIZE}px;height:${SIZE}px;object-fit:contain;padding:6px;box-sizing:border-box;border-radius:9999px;background:white;" onerror="${onError}"/>` +
    initDiv +
    `</div>${badge}</div>`
  );
}

export function LogoBubbleMarker({
  startup,
  isActive,
  onClick,
  draggable,
  onDragEnd,
}: {
  startup: Startup;
  isActive?: boolean;
  onClick: (startup: Startup) => void;
  draggable?: boolean;
  onDragEnd?: (latlng: { lat: number; lng: number }) => void;
}) {
  const draggedRef = React.useRef(false);
  
  const icon = React.useMemo(() => {
    const html = buildLogoHtml({
      name: startup.name,
      candidates: logoCandidates(startup),
      isActive,
      fundingStage: startup.fundingStage,
    });
    return L.divIcon({
      html,
      iconSize: [SIZE, SIZE + (startup.fundingStage ? 10 : 0)],
      iconAnchor: [SIZE / 2, SIZE / 2],
      className: "",
    });
  }, [startup, isActive]);

  const eventHandlers = React.useMemo(() => {
    const handlers: any = {};
    
    if (draggable) {
      handlers.dragstart = () => {
        draggedRef.current = true;
      };
      
      handlers.dragend = (e: any) => {
        const ll = e.target.getLatLng();
        onDragEnd?.({ lat: ll.lat, lng: ll.lng });
        // Reset drag flag after a brief delay to prevent click firing
        setTimeout(() => {
          draggedRef.current = false;
        }, 100);
      };
    }
    
    handlers.click = () => {
      // Only fire click if we didn't just drag
      if (!draggedRef.current) {
        onClick(startup);
      }
    };
    
    return handlers;
  }, [draggable, onDragEnd, onClick, startup]);

  return (
    <Marker
      position={[startup.lat, startup.lng]}
      icon={icon}
      draggable={Boolean(draggable)}
      eventHandlers={eventHandlers}
    />
  );
}
