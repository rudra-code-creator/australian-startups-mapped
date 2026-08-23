"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/maps/");

  return (
    <>
      {!hideHeader ? (
        <header className="fixed left-0 right-0 top-0 z-[1200]">
          <div className="mx-auto max-w-6xl px-6 pt-5">
            <div className="shell-bar flex items-center justify-between rounded-full border backdrop-blur-md px-5 py-2">
              <Link
                href="/"
                className="text-sm font-semibold text-[color:var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
              >
                Startup Map
              </Link>
              <nav className="flex items-center gap-3 sm:gap-4">
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
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>
      ) : (
        <div className="fixed bottom-5 left-4 z-[1200] sm:bottom-6 sm:left-5">
          <ThemeToggle />
        </div>
      )}

      <div className={!hideHeader ? "pt-20" : undefined}>{children}</div>
    </>
  );
}
