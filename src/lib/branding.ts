import type { Startup } from "./types";

export function domainFromWebsite(website?: string): string | null {
  if (!website) return null;
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

/** Primary logo CDN (Clearbit). Often high quality when the brand is indexed. */
export function clearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

/** Reliable low-res fallback that almost always resolves. */
export function googleFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function duckDuckGoIconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

/** Website preview image (no API key). */
export function websitePreviewUrl(website: string): string {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(website)}?w=1200`;
}

export function logoCandidates(startup: Pick<Startup, "logoUrl" | "website">): string[] {
  const urls: string[] = [];
  if (startup.logoUrl) urls.push(startup.logoUrl);
  const domain = domainFromWebsite(startup.website);
  if (domain) {
    urls.push(clearbitLogoUrl(domain));
    urls.push(googleFaviconUrl(domain));
    urls.push(duckDuckGoIconUrl(domain));
  }
  return [...new Set(urls)];
}

export function enrichStartupPresentation(startup: Startup): Startup {
  const domain = domainFromWebsite(startup.website);
  const logoUrl =
    startup.logoUrl ?? (domain ? clearbitLogoUrl(domain) : undefined);
  const imageUrls =
    startup.imageUrls && startup.imageUrls.length > 0
      ? startup.imageUrls
      : startup.website
        ? [websitePreviewUrl(startup.website)]
        : undefined;

  return {
    ...startup,
    logoUrl,
    imageUrls,
  };
}
