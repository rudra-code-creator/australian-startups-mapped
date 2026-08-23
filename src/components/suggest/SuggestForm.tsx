"use client";

import * as React from "react";
import { CITIES, COUNTRIES } from "@/lib/cities";

type FormState = {
  name: string;
  city: string;
  addressOrBuilding: string;
  website: string;
  logoUrl: string;
  email: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function SuggestForm() {
  const [values, setValues] = React.useState<FormState>({
    name: "",
    city: "",
    addressOrBuilding: "",
    website: "",
    logoUrl: "",
    email: "",
  });
  const [pending, setPending] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          city: values.city,
          addressOrBuilding: values.addressOrBuilding.trim(),
          website: values.website.trim() || undefined,
          logoUrl: values.logoUrl.trim() || undefined,
          email: values.email.trim() || undefined,
        }),
      });

      const data: unknown = await response
        .json()
        .catch(() => ({ error: "Something went wrong" }));

      if (!response.ok) {
        let message = "Something went wrong. Please try again.";
        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as any).error === "string"
        ) {
          message = (data as any).error;
        }

        const nextFieldErrors: FieldErrors = {};
        if (message.includes("name is required")) {
          nextFieldErrors.name = "name is required";
        }
        if (message.includes("invalid city")) {
          nextFieldErrors.city = "Please choose a city";
        }
        if (message.includes("address or building is required")) {
          nextFieldErrors.addressOrBuilding =
            "address or building is required";
        }
        if (message.toLowerCase().includes("website")) {
          nextFieldErrors.website = "Enter a valid URL (including https://)";
        }
        if (message.toLowerCase().includes("logoUrl".toLowerCase())) {
          nextFieldErrors.logoUrl = "Enter a valid logo URL (including https://)";
        }
        if (message.toLowerCase().includes("email")) {
          nextFieldErrors.email = "Enter a valid email address";
        }

        setFieldErrors(nextFieldErrors);
        setErrorMessage(message);
        return;
      }

      // Only show success UI when the server explicitly reports the suggestion
      // as pending. Keep `pending` local state only for disabling the form.
      const isPending =
        data &&
        typeof data === "object" &&
        (data as any).status === "pending";

      setFieldErrors({});
      setErrorMessage(null);

      if (isPending) {
        setValues({
          name: "",
          city: "",
          addressOrBuilding: "",
          website: "",
          logoUrl: "",
          email: "",
        });
        setSuccessMessage("Thanks — we'll review before it appears on the map.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const disabled = pending;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-sm"
      aria-busy={pending}
    >
      <fieldset className="space-y-5" disabled={disabled}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              Startup or hub name
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
              required
            />
            {fieldErrors.name ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              City
            </label>
            <select
              value={values.city}
              onChange={(event) => updateField("city", event.target.value)}
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
              required
            >
              <option value="">Choose a city</option>
              {COUNTRIES.map((country) => (
                <optgroup key={country.id} label={country.name}>
                  {country.citySlugs.map((slug) => (
                    <option key={slug} value={slug}>
                      {CITIES[slug].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {fieldErrors.city ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              Address or building
            </label>
            <input
              type="text"
              value={values.addressOrBuilding}
              onChange={(event) =>
                updateField("addressOrBuilding", event.target.value)
              }
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
              required
            />
            {fieldErrors.addressOrBuilding ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.addressOrBuilding}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              Website
            </label>
            <input
              type="url"
              value={values.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
            />
            {fieldErrors.website ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.website}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              Logo URL
            </label>
            <input
              type="url"
              value={values.logoUrl}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              placeholder="https://logo.example.com/startup.png"
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
            />
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Optional — used for the map bubble. We can fall back to initials
              if it fails.
            </p>
            {fieldErrors.logoUrl ? (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.logoUrl}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--ink)]">
              Your email (optional)
            </label>
            <input
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--teal)]"
            />
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Only used if we need to clarify something about the listing.
            </p>
            {fieldErrors.email ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="text-sm text-[color:var(--teal-deep)]" aria-live="polite">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-2 inline-flex items-center rounded-full bg-[color:var(--teal)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--map-shadow)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Sending…" : "Submit suggestion"}
        </button>
      </fieldset>
    </form>
  );
}

