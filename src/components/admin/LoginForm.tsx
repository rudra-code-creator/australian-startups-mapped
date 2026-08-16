"use client";

import { useState } from "react";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? "Login failed");
        return;
      }

      setUsername("");
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
      className="max-w-md rounded-xl border border-black/10 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold tracking-tight">Admin sign in</h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Enter your admin username and password to review the queue.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium" htmlFor="admin-username">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
            placeholder="ADMIN"
            autoComplete="username"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || username.trim().length === 0 || password.length === 0}
        className="mt-4 w-full rounded-lg bg-[color:var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
