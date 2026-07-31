"use client";

import { useState } from "react";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? "Login failed");
        return;
      }

      setPassword("");
      onSuccess();
    } catch {
      setError("Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-black/10 bg-white p-4 shadow-sm"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium">Admin password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}

