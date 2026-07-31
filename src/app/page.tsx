export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl rounded-3xl bg-white/80 shadow-[var(--map-shadow)] border border-slate-200 p-10 space-y-4">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[color:var(--muted)]">
          Australian Startup Map
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-[color:var(--ink)]">
          Mapping Australia&apos;s startup offices and hubs.
        </h1>
        <p className="text-base text-[color:var(--muted)]">
          A brand-forward, map-first view of Brisbane, Sydney, Melbourne,
          Adelaide, and Perth. This is a placeholder while we wire up the
          interactive maps, suggestion flows, and admin tools.
        </p>
      </div>
    </main>
  );
}

