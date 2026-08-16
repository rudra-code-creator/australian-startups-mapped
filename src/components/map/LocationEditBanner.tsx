"use client";

import * as React from "react";

export function LocationEditBanner({
  mode,
  message,
  unsavedCount,
  children,
}: {
  mode: "off" | "curator" | "public";
  message?: string;
  unsavedCount?: number;
  children?: React.ReactNode;
}) {
  if (mode === "off") return null;

  const bgColor = mode === "curator" ? "var(--teal)" : "var(--ink-blue, #1e293b)";
  const textColor = "white";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: bgColor,
        color: textColor,
        padding: "12px 16px",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "14px",
        fontWeight: "500",
      }}
    >
      <div style={{ flex: 1 }}>
        {message || `${mode === "curator" ? "Curator" : "Public"} location fix mode`}
        {unsavedCount !== undefined && unsavedCount > 0 && (
          <span style={{ marginLeft: "8px", opacity: 0.9 }}>
            ({unsavedCount} unsaved change{unsavedCount === 1 ? "" : "s"})
          </span>
        )}
      </div>
      
      {children && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {children}
        </div>
      )}
    </div>
  );
}