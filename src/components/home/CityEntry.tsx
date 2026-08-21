import Link from "next/link";
import { CITIES } from "@/lib/cities";
import type { CitySlug } from "@/lib/types";

export function CityEntry({ city, index }: { city: CitySlug; index: number }) {
  const meta = CITIES[city];
  return (
    <Link
      href={`/maps/${city}`}
      className="group flex items-baseline justify-between gap-6 py-2.5 border-b border-slate-200/80 transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
      style={{
        animationDelay: `${80 + index * 45}ms`,
      }}
    >
      <span className="min-w-0">
        <span
          className="block text-xl sm:text-2xl tracking-tight text-[color:var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {meta.name}
        </span>
        {meta.note ? (
          <span className="mt-0.5 block text-xs text-[color:var(--muted)]">
            {meta.note}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-sm font-semibold text-[color:var(--muted)] transition-colors group-hover:text-[color:var(--teal-deep)]">
        View map →
      </span>
    </Link>
  );
}
