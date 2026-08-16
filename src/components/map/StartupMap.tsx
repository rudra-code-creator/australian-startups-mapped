"use client";

import * as React from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CITIES } from "@/lib/cities";
import type { Building, CitySlug, MapMarker, Startup } from "@/lib/types";
import { CityChrome } from "./CityChrome";
import { ClusterExpand } from "./ClusterExpand";
import { HubMarker } from "./HubMarker";
import { LogoBubbleMarker } from "./LogoBubbleMarker";
import { StartupDetailPanel } from "./StartupDetailPanel";
import { LocationEditBanner } from "./LocationEditBanner";

type LayoutDraft = {
  startups: Record<string, { lat: number; lng: number; clearBuildingId?: boolean }>;
  buildings: Record<string, { lat: number; lng: number }>;
};

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
  buildings,
  isAdmin,
  canWriteSeed,
}: {
  city: CitySlug;
  markers: MapMarker[];
  startups: Startup[];
  buildings: Building[];
  isAdmin: boolean;
  canWriteSeed: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [expandedHubId, setExpandedHubId] = React.useState<string | null>(null);
  const [selectedStartupId, setSelectedStartupId] = React.useState<string | null>(
    null,
  );
  const [fixLocations, setFixLocations] = React.useState(false);
  const [layoutDraft, setLayoutDraft] = React.useState<LayoutDraft>({
    startups: {},
    buildings: {},
  });

  const q = search.trim().toLowerCase();

  // Apply draft overrides to get display positions
  const displayMarkers = React.useMemo(() => {
    return markers.map((m) => {
      if (m.kind === "single") {
        const draft = layoutDraft.startups[m.startup.id];
        if (draft) {
          return {
            ...m,
            startup: {
              ...m.startup,
              lat: draft.lat,
              lng: draft.lng,
            },
          };
        }
        return m;
      } else {
        // Hub marker - check if building position is overridden
        const draft = layoutDraft.buildings[m.buildingId];
        if (draft) {
          return {
            ...m,
            lat: draft.lat,
            lng: draft.lng,
          };
        }
        return m;
      }
    });
  }, [markers, layoutDraft]);

  const visibleMarkers = React.useMemo(() => {
    if (!q) return displayMarkers;
    return displayMarkers
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
  }, [displayMarkers, q]);

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

  const handleStartupDrag = React.useCallback((startupId: string, latlng: { lat: number; lng: number }) => {
    setLayoutDraft(prev => ({
      ...prev,
      startups: {
        ...prev.startups,
        [startupId]: latlng,
      },
    }));
  }, []);

  const handleBuildingDrag = React.useCallback((buildingId: string, latlng: { lat: number; lng: number }) => {
    setLayoutDraft(prev => ({
      ...prev,
      buildings: {
        ...prev.buildings,
        [buildingId]: latlng,
      },
    }));
  }, []);

  const unsavedCount = React.useMemo(() => {
    return Object.keys(layoutDraft.startups).length + Object.keys(layoutDraft.buildings).length;
  }, [layoutDraft]);

  const downloadDraft = React.useCallback(() => {
    // Apply draft overrides to startups and buildings for export
    const draftStartups = startups.map(startup => {
      const draft = layoutDraft.startups[startup.id];
      return draft ? { ...startup, lat: draft.lat, lng: draft.lng } : startup;
    });
    
    const draftBuildings = buildings.map(building => {
      const draft = layoutDraft.buildings[building.id];
      return draft ? { ...building, lat: draft.lat, lng: draft.lng } : building;
    });

    const data = {
      startups: draftStartups,
      buildings: draftBuildings,
      exported: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${city}-layout-draft.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [startups, buildings, layoutDraft, city]);

  const { center, zoom } = CITIES[city];

  const fixMode: "off" | "curator" | "public" = fixLocations && isAdmin ? "curator" : "off";
  const bannerHeight = fixMode !== "off" ? 48 : 0;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <LocationEditBanner
        mode={fixMode}
        unsavedCount={unsavedCount}
      >
        {fixMode === "curator" && (
          <>
            <button
              onClick={downloadDraft}
              style={{
                padding: "6px 12px",
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Download JSON
            </button>
            {canWriteSeed && (
              <button
                onClick={() => {
                  // TODO: Implement seed write in Task 7
                  alert("Seed write not yet implemented");
                }}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Write Seed
              </button>
            )}
            <button
              onClick={() => {
                setFixLocations(false);
                setLayoutDraft({ startups: {}, buildings: {} });
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </>
        )}
      </LocationEditBanner>
      
      <div style={{ marginTop: `${bannerHeight}px`, height: `calc(100% - ${bannerHeight}px)` }}>
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
                draggable={fixLocations && isAdmin}
                onDragEnd={(latlng) => handleStartupDrag(m.startup.id, latlng)}
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
              draggable={fixLocations && isAdmin}
              onDragEnd={(latlng) => handleBuildingDrag(m.buildingId, latlng)}
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
              // Keep the hub open so users can browse logos; detail panel opens beside it.
              setSelectedStartupId(s.id);
            }}
            onClose={() => setExpandedHubId(null)}
          />
        ) : null}
        </MapContainer>
      </div>

      <CityChrome
        city={city}
        totalCount={startups.length}
        visibleCount={visibleCount}
        search={search}
        onSearchChange={(v) => setSearch(v)}
        isAdmin={isAdmin}
        fixLocations={fixLocations}
        onToggleFixLocations={() => setFixLocations(prev => !prev)}
      />

      <StartupDetailPanel
        startup={selectedStartup}
        onClose={() => setSelectedStartupId(null)}
      />
    </div>
  );
}

