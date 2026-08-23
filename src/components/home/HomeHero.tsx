"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { COUNTRIES } from "@/lib/cities";
import type { CitySlug } from "@/lib/types";
import { CityEntry } from "./CityEntry";

const PRODUCT_SHOTS = [
  {
    id: "brisbane",
    city: "brisbane" as CitySlug,
    src: "/home/brisbane-map.png",
    alt: "Brisbane startup map with logo markers across the CBD and Fortitude Valley",
    label: "Brisbane",
  },
  {
    id: "sydney",
    city: "sydney" as CitySlug,
    src: "/home/sydney-map.png",
    alt: "Sydney startup map with logo markers across the CBD and inner suburbs",
    label: "Sydney",
  },
  {
    id: "auckland",
    city: "auckland" as CitySlug,
    src: "/home/auckland-map.png",
    alt: "Auckland startup map with logo markers and funding-stage labels across the CBD and harbour",
    label: "Auckland",
  },
  {
    id: "suva",
    city: "suva" as CitySlug,
    src: "/home/suva-map.png",
    alt: "Suva startup map with logo markers along the Fiji capital waterfront",
    label: "Suva",
  },
  {
    id: "jakarta",
    city: "jakarta" as CitySlug,
    src: "/home/jakarta-map.png",
    alt: "Jakarta startup map with logo markers and funding-stage labels across the metro area",
    label: "Jakarta",
  },
  {
    id: "singapore-johor-batam",
    city: "johor-bahru" as CitySlug,
    src: "/home/singapore-johor-batam-map.png",
    alt: "Singapore–Johor–Batam startup map showing the shared cross-border ecosystem",
    label: "Singapore–Johor–Batam",
  },
  {
    id: "klang-valley",
    city: "klang-valley" as CitySlug,
    src: "/home/klang-valley-map.png",
    alt: "Klang Valley startup map with logo markers across Kuala Lumpur, Klang, and Seremban",
    label: "Klang Valley",
  },
  {
    id: "delhi-ncr",
    city: "delhi-ncr" as CitySlug,
    src: "/home/delhi-ncr-map.png",
    alt: "Delhi-NCR startup map with logo markers across Delhi, Gurgaon, and Noida",
    label: "Delhi-NCR",
  },
  {
    id: "greater-bay-area",
    city: "hong-kong" as CitySlug,
    src: "/home/greater-bay-area-map.png",
    alt: "Greater Bay Area startup map spanning Hong Kong, Shenzhen, Dongguan, Guangzhou, and Zhongshan / Zhuhai",
    label: "Greater Bay Area",
  },
] as const;

const LINKED_CITIES = new Set<CitySlug>(PRODUCT_SHOTS.map((shot) => shot.city));

type Connector = {
  id: string;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function buildCurve(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(48, Math.abs(x2 - x1) * 0.42);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function HomeHero() {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const [connectors, setConnectors] = React.useState<Connector[]>([]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (window.innerWidth < 1024) {
          setConnectors([]);
          return;
        }

        const rootRect = root.getBoundingClientRect();
        const next: Connector[] = [];

        for (const shot of PRODUCT_SHOTS) {
          const cityEl = root.querySelector<HTMLElement>(
            `[data-home-city="${shot.city}"]`,
          );
          const shotEl = root.querySelector<HTMLElement>(
            `[data-home-shot="${shot.id}"]`,
          );
          if (!cityEl || !shotEl) continue;

          const cityRect = cityEl.getBoundingClientRect();
          const shotRect = shotEl.getBoundingClientRect();

          const x1 = cityRect.right - rootRect.left + 6;
          const y1 = cityRect.top + cityRect.height * 0.45 - rootRect.top;
          const x2 = shotRect.left - rootRect.left - 4;
          const y2 = shotRect.top + Math.min(72, shotRect.height * 0.28) - rootRect.top;

          if (x2 <= x1 + 24) continue;

          next.push({
            id: shot.id,
            d: buildCurve(x1, y1, x2, y2),
            x1,
            y1,
            x2,
            y2,
          });
        }

        setConnectors(next);
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <section ref={rootRef} className="home-atmosphere relative overflow-hidden">
        <svg className="home-connectors hidden lg:block" aria-hidden>
          <defs>
            <linearGradient id="home-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.15" />
              <stop offset="45%" stopColor="var(--teal-deep)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {connectors.map((line) => (
            <g key={line.id}>
              <path className="glow" d={line.d} />
              <path className="soft" d={line.d} />
              <path className="core" d={line.d} />
              <circle className="node" cx={line.x1} cy={line.y1} r="2.4" />
              <circle className="node" cx={line.x2} cy={line.y2} r="2.4" />
            </g>
          ))}
        </svg>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 lg:py-20 xl:gap-16">
          <div className="animate-fade-up lg:max-w-xl lg:pt-4">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[color:var(--teal-deep)]">
              Startup Map
            </p>
            <h1
              className="home-title-shine mt-4 text-4xl sm:text-5xl leading-[1.02] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find the offices, hubs, and co-location energy.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[color:var(--muted)]">
              A curated, map-first view of where notable startups sit across
              Australia, New Zealand, the Pacific, Indonesia, Malaysia,
              Singapore, India, and the Greater Bay Area.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/maps/brisbane"
                className="home-cta inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-[color:var(--paper)] bg-[color:var(--teal)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
              >
                Open Brisbane
              </Link>
              <span className="text-sm text-[color:var(--muted)]">
                Curated / illustrative — not a complete census.
              </span>
            </div>

            <div className="mt-12">
              <div className="flex items-end justify-between gap-6">
                <h2
                  className="text-xl sm:text-2xl text-[color:var(--ink-strong)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Choose a city
                </h2>
                <p className="text-sm text-[color:var(--muted)]">
                  Grouped by country.
                </p>
              </div>

              <div className="mt-6 space-y-8">
                {COUNTRIES.map((country, countryIndex) => {
                  const startIndex = COUNTRIES.slice(0, countryIndex).reduce(
                    (total, item) => total + item.citySlugs.length,
                    0,
                  );
                  return (
                    <section key={country.id} className="animate-rise-links">
                      <h3 className="text-xs font-semibold tracking-[0.28em] uppercase text-[color:var(--teal-deep)]">
                        {country.name}
                      </h3>
                      <div className="mt-2">
                        {country.citySlugs.map((slug, offset) => (
                          <CityEntry
                            key={slug}
                            city={slug}
                            index={startIndex + offset}
                            linked={LINKED_CITIES.has(slug)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="home-product-shots animate-fade-up flex flex-col gap-5 lg:sticky lg:top-8">
            {PRODUCT_SHOTS.map((shot, index) => (
              <figure
                key={shot.src}
                data-home-shot={shot.id}
                className="home-shot-frame m-0"
              >
                <div className="home-shot-inner">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={1600}
                    height={1000}
                    className="home-product-shot block h-auto w-full object-cover object-center"
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    priority={index < 2}
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-3 px-1 pt-2.5 text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--muted)]">
                  <span>{shot.label}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--border)] to-transparent" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
