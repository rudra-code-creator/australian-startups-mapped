"use client";

import * as React from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CITIES } from "@/lib/cities";
import type { CitySlug, MapMarker, Startup } from "@/lib/types";
import { CityChrome } from "./CityChrome";
import { ClusterExpand } from "./ClusterExpand";
import { HubMarker } from "./HubMarker";
import { LogoBubbleMarker } from "./LogoBubbleMarker";
import { StartupDetailPanel } from "./StartupDetailPanel";

function matchesSearch(startup: Startup, q: string) {
  if (!q) return true;
  return startup.name.toLowerCase().includes(q);
}

function MapClickCloser({ onClose }: { onClose: () => void }) {
  useMapEvents({
    click: () => onClose(),
  });
  return null;
}

function FlyToSelection({ startup }: { startup: Startup | null }) {
  const map = useMap();

  React.useEffect(() => {
    if (!startup) return;
    map.flyTo([startup.lat, startup.lng], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.45,
    });
  }, [map, startup?.id, startup?.lat, startup?.lng]);

  return null;
}

export function StartupMap({
  city,
  markers,
  startups,
}: {
  city: CitySlug;
  markers: MapMarker[];
  startups: Startup[];
}) {
  const [search, setSearch] = React.useState("");
  const [expandedHubId, setExpandedHubId] = React.useState<string | null>(null);
  const [selectedStartupId, setSelectedStartupId] = React.useState<string | null>(
    null,
  );

  const q = search.trim().toLowerCase();

  const visibleMarkers = React.useMemo(() => {
    if (!q) return markers;
    return markers
      .map((m) => {
        if (m.kind === "single") {
          return matchesSearch(m.startup, q) ? m : null;
        }
        const filtered = m.startups.filter((s) => matchesSearch(s, q));
        return filtered.length
          ? { ...m, startups: filtered, buildingName: m.buildingName }
          : null;
      })
      .filter(Boolean) as MapMarker[];
  }, [markers, q]);

  const visibleCount = React.useMemo(() => {
    if (!q) return startups.length;
    return startups.filter((s) => matchesSearch(s, q)).length;
  }, [startups, q]);

  const selectedStartup = React.useMemo(() => {
    if (!selectedStartupId) return null;
    return startups.find((s) => s.id === selectedStartupId) ?? null;
  }, [selectedStartupId, startups]);

  const expandedHub = React.useMemo(() => {
    if (!expandedHubId) return null;
    const hub = visibleMarkers.find(
      (m) => m.kind === "hub" && m.buildingId === expandedHubId,
    );
    return hub?.kind === "hub" ? hub : null;
  }, [expandedHubId, visibleMarkers]);

  const closeAll = React.useCallback(() => {
    setExpandedHubId(null);
    setSelectedStartupId(null);
  }, []);

  const { center, zoom } = CITIES[city];

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickCloser onClose={closeAll} />
        <FlyToSelection startup={selectedStartup} />

        {visibleMarkers.map((m) => {
          if (m.kind === "single") {
            return (
              <LogoBubbleMarker
                key={m.startup.id}
                startup={m.startup}
                isActive={m.startup.id === selectedStartupId}
                onClick={(s) => {
                  setExpandedHubId(null);
                  setSelectedStartupId(s.id);
                }}
              />
            );
          }
          return (
            <HubMarker
              key={m.buildingId}
              lat={m.lat}
              lng={m.lng}
              buildingName={m.buildingName}
              count={m.startups.length}
              isActive={m.buildingId === expandedHubId}
              onClick={() => {
                setSelectedStartupId(null);
                setExpandedHubId((prev) => (prev === m.buildingId ? null : m.buildingId));
              }}
            />
          );
        })}

        {expandedHub ? (
          <ClusterExpand
            lat={expandedHub.lat}
            lng={expandedHub.lng}
            buildingName={expandedHub.buildingName}
            startups={expandedHub.startups}
            onSelect={(s) => {
              setExpandedHubId(null);
              setSelectedStartupId(s.id);
            }}
            onClose={() => setExpandedHubId(null)}
          />
        ) : null}
      </MapContainer>

      <CityChrome
        city={city}
        totalCount={startups.length}
        visibleCount={visibleCount}
        search={search}
        onSearchChange={(v) => setSearch(v)}
      />

      <StartupDetailPanel
        startup={selectedStartup}
        onClose={() => setSelectedStartupId(null)}
      />
    </div>
  );
}

