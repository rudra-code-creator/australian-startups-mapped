"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/maps/");

  return (
    <>
      {!hideHeader ? (
        <header className="fixed left-0 right-0 top-0 z-[1200]">
          <div className="mx-auto max-w-6xl px-6 pt-5">
            <div className="flex items-center justify-between rounded-full border border-slate-200/70 bg-white/80 backdrop-blur-md px-5 py-2 shadow-[var(--map-shadow)]">
              <Link
                href="/"
                className="text-sm font-semibold text-[color:var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
              >
                Startup Map
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/maps/brisbane"
                  className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--teal-deep)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
                >
                  Maps
                </Link>
                <Link
                  href="/suggest"
                  className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--teal-deep)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
                >
                  Suggest
                </Link>
              </nav>
            </div>
          </div>
        </header>
      ) : null}

      <div className={!hideHeader ? "pt-20" : undefined}>{children}</div>
    </>
  );
}

