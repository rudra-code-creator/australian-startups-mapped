'use client';

import { useCallback, useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { PendingQueue } from "./PendingQueue";
import { LocationFixesQueue } from "./LocationFixesQueue";

type TabId = "new-startups" | "location-fixes";

export function AdminTabs() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("new-startups");

  const checkAuth = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/me", { method: "GET" });
      if (!res.ok) {
        setAuthed(false);
        if (res.status !== 401) {
          setError("Failed to verify admin session");
        }
        return;
      }
      const json = (await res.json()) as { authenticated?: boolean };
      setAuthed(json.authenticated === true);
    } catch {
      setAuthed(false);
      setError("Failed to verify admin session");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (authed === false) {
    return (
      <section className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        <LoginForm onSuccess={checkAuth} />
      </section>
    );
  }

  if (authed === null || checking) {
    return (
      <section className="space-y-2 text-sm text-[color:var(--muted)]">
        <div>Checking admin session…</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 border-b border-black/10">
        <button
          type="button"
          onClick={() => setActiveTab("new-startups")}
          className={`rounded-t-lg px-4 py-2 text-sm ${
            activeTab === "new-startups"
              ? "bg-[color:var(--accent)] text-white"
              : "bg-transparent text-black/70 hover:bg-black/5"
          }`}
        >
          New startups
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("location-fixes")}
          className={`rounded-t-lg px-4 py-2 text-sm ${
            activeTab === "location-fixes"
              ? "bg-[color:var(--accent)] text-white"
              : "bg-transparent text-black/70 hover:bg-black/5"
          }`}
        >
          Location fixes
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "new-startups" ? (
          <PendingQueue skipAuthGate />
        ) : (
          <LocationFixesQueue />
        )}
      </div>
    </section>
  );
}

