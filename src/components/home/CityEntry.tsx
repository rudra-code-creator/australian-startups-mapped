import Link from "next/link";
import { CITIES } from "@/lib/cities";
import type { CitySlug } from "@/lib/types";

export function CityEntry({ city, index }: { city: CitySlug; index: number }) {
  return (
    <Link
      href={`/maps/${city}`}
      className="group flex items-baseline justify-between gap-6 py-4 border-b border-slate-200/80 transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
      style={{
        animationDelay: `${140 + index * 70}ms`,
      }}
    >
      <span
        className="text-2xl sm:text-3xl tracking-tight text-[color:var(--ink)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {CITIES[city].name}
      </span>
      <span className="text-sm font-semibold text-[color:var(--muted)] transition-colors group-hover:text-[color:var(--teal-deep)]">
        View map →
      </span>
    </Link>
  );
}

