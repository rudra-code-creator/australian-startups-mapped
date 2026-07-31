import * as React from "react";

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return (first + (second ?? "")).toUpperCase();
}

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
        background: "var(--teal)",
        color: "white",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        letterSpacing: "0.06em",
        userSelect: "none",
      }}
      aria-label={name}
      title={name}
    >
      <span style={{ fontSize: Math.max(12, Math.round(size * 0.34)) }}>
        {initials}
      </span>
    </div>
  );
}

