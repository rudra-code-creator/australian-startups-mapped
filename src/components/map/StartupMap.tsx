"use client";

import * as React from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { CITIES } from "@/lib/cities";
import { groupMarkers } from "@/lib/group-markers";
import { metersBetween, MIN_CORRECTION_METERS } from "@/lib/geo";
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

function applyDraftToStartups(startups: Startup[], draft: LayoutDraft["startups"]): Startup[] {
  return startups.map(startup => {
    const change = draft[startup.id];
    if (!change) return startup;
    
    return {
      ...startup,
      lat: change.lat,
      lng: change.lng,
      buildingId: change.clearBuildingId ? undefined : startup.buildingId,
      buildingName: change.clearBuildingId ? undefined : startup.buildingName,
    };
  });
}

function applyDraftToBuildings(buildings: Building[], draft: LayoutDraft["buildings"]): Building[] {
  return buildings.map(building => {
    const change = draft[building.id];
    if (!change) return building;
    
    return {
      ...building,
      lat: change.lat,
      lng: change.lng,
    };
  });
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

  // Apply draft overrides and recompute markers with groupMarkers
  const displayMarkers = React.useMemo(() => {
    const draftedStartups = applyDraftToStartups(startups, layoutDraft.startups);
    const draftedBuildings = applyDraftToBuildings(buildings, layoutDraft.buildings);
    return groupMarkers(draftedStartups, draftedBuildings);
  }, [startups, buildings, layoutDraft]);

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

  const handleMemberDragEnd = React.useCallback((startup: Startup, latlng: { lat: number; lng: number }) => {
    if (!startup.buildingId) return;
    
    // Find the hub center (with draft applied if exists)
    const building = buildings.find(b => b.id === startup.buildingId);
    const buildingDraft = layoutDraft.buildings[startup.buildingId];
    const hubCenter = {
      lat: buildingDraft?.lat ?? building?.lat ?? startup.lat,
      lng: buildingDraft?.lng ?? building?.lng ?? startup.lng,
    };

    const distance = metersBetween(hubCenter, latlng);
    
    // If dragged more than MIN_CORRECTION_METERS from hub, split the member out
    if (distance > MIN_CORRECTION_METERS) {
      setLayoutDraft(prev => ({
        ...prev,
        startups: {
          ...prev.startups,
          [startup.id]: {
            lat: latlng.lat,
            lng: latlng.lng,
            clearBuildingId: true,
          },
        },
      }));
    }
  }, [buildings, layoutDraft.buildings]);

  const unsavedCount = React.useMemo(() => {
    return Object.keys(layoutDraft.startups).length + Object.keys(layoutDraft.buildings).length;
  }, [layoutDraft]);

  const downloadDraft = React.useCallback(() => {
    // Apply draft overrides to startups and buildings for export
    const draftStartups = applyDraftToStartups(startups, layoutDraft.startups);
    const draftBuildings = applyDraftToBuildings(buildings, layoutDraft.buildings);

    // Download startups
    const startupsData = {
      startups: draftStartups,
      exported: new Date().toISOString(),
    };
    const startupsBlob = new Blob([JSON.stringify(draftStartups, null, 2)], { type: 'application/json' });
    const startupsUrl = URL.createObjectURL(startupsBlob);
    const startupsLink = document.createElement('a');
    startupsLink.href = startupsUrl;
    startupsLink.download = `${city}.json`;
    startupsLink.click();
    URL.revokeObjectURL(startupsUrl);

    // If buildings changed, also download buildings
    if (Object.keys(layoutDraft.buildings).length > 0) {
      const buildingsBlob = new Blob([JSON.stringify(draftBuildings, null, 2)], { type: 'application/json' });
      const buildingsUrl = URL.createObjectURL(buildingsBlob);
      const buildingsLink = document.createElement('a');
      buildingsLink.href = buildingsUrl;
      buildingsLink.download = `buildings-${city}.json`;
      buildingsLink.click();
      URL.revokeObjectURL(buildingsUrl);
    }
  }, [startups, buildings, layoutDraft, city]);

  const [isWriting, setIsWriting] = React.useState(false);

  const writeSeed = React.useCallback(async () => {
    if (isWriting) return;
    
    setIsWriting(true);
    try {
      const draftStartups = applyDraftToStartups(startups, layoutDraft.startups);
      const draftBuildings = applyDraftToBuildings(buildings, layoutDraft.buildings);

      const payload = {
        startups: draftStartups,
        buildings: Object.keys(layoutDraft.buildings).length > 0 ? draftBuildings : undefined,
      };

      const response = await fetch(`/api/admin/seed-write/${city}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Write failed');
      }

      // Success - clear the draft and show success
      setLayoutDraft({ startups: {}, buildings: {} });
      alert('Seed data written successfully!');
    } catch (error) {
      console.error('Write seed failed:', error);
      alert(`Write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsWriting(false);
    }
  }, [city, startups, buildings, layoutDraft, isWriting]);

  const handleToggleOffConfirm = React.useCallback(() => {
    if (unsavedCount > 0) {
      const confirmed = window.confirm('Discard unsaved layout edits?');
      if (!confirmed) return;
    }
    setFixLocations(false);
    setLayoutDraft({ startups: {}, buildings: {} });
  }, [unsavedCount]);

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
                onClick={writeSeed}
                disabled={isWriting}
                style={{
                  padding: "6px 12px",
                  backgroundColor: isWriting ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "12px",
                  cursor: isWriting ? "not-allowed" : "pointer",
                  opacity: isWriting ? 0.6 : 1,
                }}
              >
                {isWriting ? "Writing..." : "Write Seed"}
              </button>
            )}
            <button
              onClick={handleToggleOffConfirm}
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
            draggable={fixLocations && isAdmin}
            onMemberDragEnd={handleMemberDragEnd}
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

