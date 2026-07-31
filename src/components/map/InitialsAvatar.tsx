import * as React from "react";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

/** Soft branded monogram used only when every logo source fails. */
export function InitialsAvatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = initialsFromName(name);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background:
          "linear-gradient(145deg, rgba(15,107,107,0.16) 0%, rgba(12,27,36,0.08) 100%)",
        color: "var(--teal-deep)",
        border: "1px solid rgba(15, 107, 107, 0.22)",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        letterSpacing: "0.04em",
        userSelect: "none",
        boxSizing: "border-box",
      }}
      aria-label={name}
      title={name}
    >
      <span style={{ fontSize: Math.max(11, Math.round(size * 0.3)) }}>
        {initials}
      </span>
    </div>
  );
}
