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

type PublicCorrection = {
  targetKind: "startup" | "building";
  targetId: string;
  name: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  clearBuildingId?: boolean;
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

function PublicCorrectionModal({
  correction,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  correction: PublicCorrection;
  onSubmit: (note: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [note, setNote] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);

  const hasMovement = React.useMemo(() => {
    const distance = metersBetween(
      { lat: correction.fromLat, lng: correction.fromLng },
      { lat: correction.toLat, lng: correction.toLng }
    );
    return distance > MIN_CORRECTION_METERS;
  }, [correction]);

  if (!hasMovement) {
    return null; // Don't show form until marker is moved
  }

  if (!showForm) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: 18,
          border: "1px solid rgba(15, 107, 107, 0.14)",
          boxShadow: "var(--map-shadow)",
          padding: 24,
          zIndex: 1300,
          maxWidth: "min(420px, calc(100vw - 32px))",
        }}
      >
        <div className="text-lg font-semibold text-[color:var(--ink)] mb-2">
          Submit location correction?
        </div>
        <div className="text-sm text-[color:var(--muted)] mb-4">
          You've moved {correction.name} to a new location. Would you like to submit this correction for review?
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm text-white rounded-lg"
            style={{ backgroundColor: "var(--teal)" }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        borderRadius: 18,
        border: "1px solid rgba(15, 107, 107, 0.14)",
        boxShadow: "var(--map-shadow)",
        padding: 24,
        zIndex: 1300,
        maxWidth: "min(420px, calc(100vw - 32px))",
      }}
    >
      <div className="text-lg font-semibold text-[color:var(--ink)] mb-2">
        Add a note (optional)
      </div>
      <div className="text-sm text-[color:var(--muted)] mb-4">
        Help us understand why this location correction is needed.
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g., 'They moved to this building last month' or 'The pin was on the wrong street'"
        className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(note)}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: "var(--teal)" }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
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
  const [publicCorrection, setPublicCorrection] = React.useState<PublicCorrection | null>(null);

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

  const handleReportLocation = React.useCallback((startup: Startup) => {
    setPublicCorrection({
      targetKind: "startup",
      targetId: startup.id,
      name: startup.name,
      fromLat: startup.lat,
      fromLng: startup.lng,
      toLat: startup.lat,
      toLng: startup.lng,
      clearBuildingId: Boolean(startup.buildingId),
    });
    setSelectedStartupId(null);
    setExpandedHubId(null);
  }, []);

  const handleReportHubLocation = React.useCallback((building: { id: string; name: string; lat: number; lng: number }) => {
    setPublicCorrection({
      targetKind: "building",
      targetId: building.id,
      name: building.name,
      fromLat: building.lat,
      fromLng: building.lng,
      toLat: building.lat,
      toLng: building.lng,
    });
    setSelectedStartupId(null);
    setExpandedHubId(null);
  }, []);

  const handlePublicDragEnd = React.useCallback((latlng: { lat: number; lng: number }) => {
    if (!publicCorrection) return;
    setPublicCorrection(prev => prev ? {
      ...prev,
      toLat: latlng.lat,
      toLng: latlng.lng,
    } : null);
  }, [publicCorrection]);

  const handlePublicCancel = React.useCallback(() => {
    setPublicCorrection(null);
  }, []);

  const [isSubmittingCorrection, setIsSubmittingCorrection] = React.useState(false);

  const handlePublicSubmit = React.useCallback(async (note: string) => {
    if (!publicCorrection || isSubmittingCorrection) return;

    setIsSubmittingCorrection(true);
    try {
      const response = await fetch('/api/location-corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetKind: publicCorrection.targetKind,
          targetId: publicCorrection.targetId,
          fromLat: publicCorrection.fromLat,
          fromLng: publicCorrection.fromLng,
          toLat: publicCorrection.toLat,
          toLng: publicCorrection.toLng,
          note: note.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400 && error.code === 'TINY_MOVE') {
          alert('Please drag the marker further from its current position.');
          return;
        }
        throw new Error(error.error || 'Submission failed');
      }

      // Success - show confirmation and clear session
      alert('Location correction submitted for review. Thank you!');
      setPublicCorrection(null);
    } catch (error) {
      console.error('Submit correction failed:', error);
      alert(`Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmittingCorrection(false);
    }
  }, [publicCorrection, isSubmittingCorrection]);

  const { center, zoom } = CITIES[city];

  const fixMode: "off" | "curator" | "public" = 
    publicCorrection ? "public" :
    fixLocations && isAdmin ? "curator" : "off";
  const bannerHeight = fixMode !== "off" ? 48 : 0;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <LocationEditBanner
        mode={fixMode}
        message={
          fixMode === "public" 
            ? `Drag the marker for ${publicCorrection?.name} to the correct location`
            : undefined
        }
        unsavedCount={fixMode === "curator" ? unsavedCount : undefined}
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
        {fixMode === "public" && (
          <button
            onClick={handlePublicCancel}
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
            const isPublicTarget = publicCorrection?.targetKind === "startup" && publicCorrection.targetId === m.startup.id;
            return (
              <LogoBubbleMarker
                key={m.startup.id}
                startup={m.startup}
                isActive={m.startup.id === selectedStartupId}
                onClick={(s) => {
                  if (publicCorrection) return; // No clicks during public correction
                  setExpandedHubId(null);
                  setSelectedStartupId(s.id);
                }}
                draggable={(fixLocations && isAdmin) || isPublicTarget}
                onDragEnd={(latlng) => {
                  if (isPublicTarget) {
                    handlePublicDragEnd(latlng);
                  } else {
                    handleStartupDrag(m.startup.id, latlng);
                  }
                }}
              />
            );
          }
          const isPublicTarget = publicCorrection?.targetKind === "building" && publicCorrection.targetId === m.buildingId;
          return (
            <HubMarker
              key={m.buildingId}
              lat={m.lat}
              lng={m.lng}
              buildingName={m.buildingName}
              count={m.startups.length}
              isActive={m.buildingId === expandedHubId}
              onClick={() => {
                if (publicCorrection) return; // No clicks during public correction
                setSelectedStartupId(null);
                setExpandedHubId((prev) => (prev === m.buildingId ? null : m.buildingId));
              }}
              draggable={(fixLocations && isAdmin) || isPublicTarget}
              onDragEnd={(latlng) => {
                if (isPublicTarget) {
                  handlePublicDragEnd(latlng);
                } else {
                  handleBuildingDrag(m.buildingId, latlng);
                }
              }}
            />
          );
        })}

        {expandedHub && !publicCorrection ? (
          <ClusterExpand
            lat={expandedHub.lat}
            lng={expandedHub.lng}
            buildingName={expandedHub.buildingName}
            buildingId={expandedHub.buildingId}
            startups={expandedHub.startups}
            onSelect={(s) => {
              // Keep the hub open so users can browse logos; detail panel opens beside it.
              setSelectedStartupId(s.id);
            }}
            onClose={() => setExpandedHubId(null)}
            draggable={fixLocations && isAdmin}
            onMemberDragEnd={handleMemberDragEnd}
            onReportHubLocation={handleReportHubLocation}
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
        onReportLocation={handleReportLocation}
      />

      {publicCorrection && (
        <PublicCorrectionModal
          correction={publicCorrection}
          onSubmit={handlePublicSubmit}
          onCancel={handlePublicCancel}
          isSubmitting={isSubmittingCorrection}
        />
      )}
    </div>
  );
}

