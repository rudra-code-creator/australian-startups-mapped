import Link from "next/link";
import { SuggestForm } from "@/components/suggest/SuggestForm";

export default function SuggestPage() {
  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[color:var(--muted)]">
          Suggest a startup
        </p>
        <h1
          className="mt-4 text-3xl sm:text-4xl tracking-tight text-[color:var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Put your startup on the map.
        </h1>
        <p className="mt-5 text-base text-[color:var(--muted)]">
          Share a startup or hub you think belongs on the Australian Startup
          Map. Suggestions are reviewed before they appear publicly.
        </p>

        <div className="mt-10">
          <SuggestForm />
        </div>

        <div className="mt-8">
          <Link
            href="/maps/brisbane"
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[color:var(--teal)] shadow-[var(--map-shadow)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
          >
            Open Brisbane map →
          </Link>
        </div>
      </div>
    </main>
  );
}

