import Link from "next/link";
import { CITY_SLUGS } from "@/lib/cities";
import { CityEntry } from "./CityEntry";

export function HomeHero() {
  return (
    <main className="min-h-screen">
      <section className="home-atmosphere relative overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[color:var(--muted)]">
              Australian Startup Map
            </p>
            <h1
              className="mt-4 text-4xl sm:text-5xl leading-[1.02] tracking-tight text-[color:var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Find the offices, hubs, and co-location energy.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[color:var(--muted)]">
              A curated, map-first view of where notable startups sit across
              Australia’s major cities.
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
          </div>

          <div className="mt-14 max-w-3xl">
            <div className="flex items-end justify-between gap-6">
              <h2
                className="text-xl sm:text-2xl text-[color:var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Choose a city
              </h2>
              <p className="text-sm text-[color:var(--muted)]">
                Five maps. One interaction model.
              </p>
            </div>

            <div className="mt-4 animate-rise-links">
              {CITY_SLUGS.map((slug, i) => (
                <CityEntry key={slug} city={slug} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

