import Image from "next/image";
import Link from "next/link";
import { COUNTRIES } from "@/lib/cities";
import { CityEntry } from "./CityEntry";

const PRODUCT_SHOTS = [
  {
    src: "/home/brisbane-map.png",
    alt: "Brisbane startup map with logo markers across the CBD and Fortitude Valley",
    label: "Brisbane",
  },
  {
    src: "/home/sydney-map.png",
    alt: "Sydney startup map with logo markers across the CBD and inner suburbs",
    label: "Sydney",
  },
] as const;

export function HomeHero() {
  return (
    <main className="min-h-screen">
      <section className="home-atmosphere relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 lg:py-20 xl:gap-16">
          <div className="animate-fade-up lg:max-w-xl lg:pt-4">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[color:var(--muted)]">
              Startup Map
            </p>
            <h1
              className="mt-4 text-4xl sm:text-5xl leading-[1.02] tracking-tight text-[color:var(--ink)]"
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
                className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[color:var(--teal)] shadow-[var(--map-shadow)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
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
                  className="text-xl sm:text-2xl text-[color:var(--ink)]"
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
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="home-product-shots animate-fade-up flex flex-col gap-4 lg:sticky lg:top-8">
            {PRODUCT_SHOTS.map((shot) => (
              <figure key={shot.src} className="m-0 overflow-hidden">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1600}
                  height={1000}
                  className="home-product-shot block h-auto w-full object-cover object-center"
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  priority
                />
                <figcaption className="pt-2 text-xs font-semibold tracking-[0.22em] uppercase text-[color:var(--muted)]">
                  {shot.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
