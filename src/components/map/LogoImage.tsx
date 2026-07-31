"use client";

import * as React from "react";
import { InitialsAvatar } from "./InitialsAvatar";
import { logoCandidates } from "@/lib/branding";
import type { Startup } from "@/lib/types";

export function LogoImage({
  startup,
  size,
  className,
}: {
  startup: Pick<Startup, "name" | "logoUrl" | "website">;
  size: number;
  className?: string;
}) {
  const candidates = React.useMemo(() => logoCandidates(startup), [startup]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [startup.name, startup.logoUrl, startup.website]);

  const src = candidates[index];

  if (!src) {
    return <InitialsAvatar name={startup.name} size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        objectFit: "contain",
        background: "white",
        padding: Math.max(4, Math.round(size * 0.08)),
        boxSizing: "border-box",
        display: "block",
      }}
      onError={() => {
        setIndex((i) => i + 1);
      }}
    />
  );
}
