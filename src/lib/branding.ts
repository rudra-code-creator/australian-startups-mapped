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

export function unavatarDomainUrl(domain: string): string {
  return `https://unavatar.io/${domain}?fallback=false`;
}

export function unavatarGoogleUrl(domain: string): string {
  return `https://unavatar.io/google/${domain}`;
}

export function unavatarDuckDuckGoUrl(domain: string): string {
  return `https://unavatar.io/duckduckgo/${domain}`;
}

export function clearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

export function googleFaviconUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function gstaticFaviconUrl(domain: string, size = 128): string {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=${size}`;
}

export function duckDuckGoIconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export function websitePreviewUrl(website: string): string {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(website)}?w=1200`;
}

export function localLogoPath(startupId: string): string {
  return `/logos/${startupId}.png`;
}

/**
 * Ordered logo candidates. Local downloads win first, then aggregators, then favicons.
 */
export function logoCandidates(
  startup: Pick<Startup, "id" | "logoUrl" | "website">,
): string[] {
  const urls: string[] = [];
  if (startup.id) urls.push(localLogoPath(startup.id));
  if (startup.logoUrl) urls.push(startup.logoUrl);

  const domain = domainFromWebsite(startup.website);
  if (domain) {
    urls.push(unavatarDomainUrl(domain));
    urls.push(unavatarGoogleUrl(domain));
    urls.push(clearbitLogoUrl(domain));
    urls.push(gstaticFaviconUrl(domain, 128));
    urls.push(googleFaviconUrl(domain, 128));
    urls.push(unavatarDuckDuckGoUrl(domain));
    urls.push(duckDuckGoIconUrl(domain));
  }

  return [...new Set(urls)];
}

export function enrichStartupPresentation(startup: Startup): Startup {
  const domain = domainFromWebsite(startup.website);
  const candidates = logoCandidates(startup);
  const logoUrl = candidates[0] ?? (domain ? unavatarDomainUrl(domain) : undefined);
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
