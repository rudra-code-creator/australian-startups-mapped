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
  draggable,
  onDragEnd,
}: {
  lat: number;
  lng: number;
  buildingName: string;
  count: number;
  isActive?: boolean;
  onClick: () => void;
  draggable?: boolean;
  onDragEnd?: (latlng: { lat: number; lng: number }) => void;
}) {
  const draggedRef = React.useRef(false);
  
  const icon = React.useMemo(() => {
    const html = buildHubHtml({ label: buildingName, count, isActive });
    return L.divIcon({
      html,
      iconSize: [SIZE, SIZE],
      iconAnchor: [SIZE / 2, SIZE / 2],
      className: "",
    });
  }, [buildingName, count, isActive]);

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
        onClick();
      }
    };
    
    return handlers;
  }, [draggable, onDragEnd, onClick]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      draggable={Boolean(draggable)}
      eventHandlers={eventHandlers}
    />
  );
}

