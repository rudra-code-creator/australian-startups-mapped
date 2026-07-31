/**
 * Download best-available logos into public/logos/{id}.png
 * and attach websites for known brands missing them.
 *
 * Usage:
 *   node scripts/download-logos.mjs
 *   node scripts/download-logos.mjs --force   # re-fetch tiny/bad files
 *
 * Optional: LOGO_DEV_TOKEN=pk_... for img.logo.dev (higher quality)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logosDir = path.join(root, "public", "logos");
fs.mkdirSync(logosDir, { recursive: true });

const force = process.argv.includes("--force");
const LOGO_DEV_TOKEN = process.env.LOGO_DEV_TOKEN || "";

/** Absolute floor — reject empty/error stubs. */
const ABS_MIN_BYTES = 150;
/** Soft size gate for non-PNG (jpeg/ico/webp) where we cannot read dimensions. */
const MIN_BYTES = 900;
/** Prefer at least this PNG edge length when we can read IHDR. */
const MIN_PX = 32;

/** Known websites for entries that were missing them. */
const WEBSITE_BY_ID = {
  oneqode: "https://oneqode.com",
  "resapp-health": "https://www.resapphealth.com.au",
  edexia: "https://edexia.com",
  neuphoria: "https://neuphoria.com",
  "wotif-group": "https://www.wotif.com",
  "clearsky-genomics": "https://www.clearskymedical.com",
  "go-locum": "https://golocum.com.au",
  knowa: "https://knowa.co",
  extrasjar: "https://extrasjar.com",
  "syd-klarna-au": "https://www.klarna.com",
  "syd-unlockd": "https://www.unlockd.me",
  "syd-tyro-health": "https://www.healthmatch.io",
  "syd-nabtech": "https://www.nab.com.au",
  "syd-tyro-labs": "https://reejig.com",
  "syd-protecht": "https://www.talon.one",
  "syd-mrt-yieldify": "https://www.yieldify.com",
  "syd-zenobe": "https://hismileteeth.com",
  "syd-paymentwall-au": "https://www.chargefox.com",
  "syd-lovewell": "https://healthengine.com.au",
  "syd-archistar": "https://archistar.ai",
  "syd-redbubble-syd": "https://www.redbubble.com",
  "syd-better-caring": "https://mable.com.au",
  "syd-wisetech-syd": "https://www.wisetechglobal.com",
  "syd-tyro-data": "https://www.datastax.com",
  "syd-tyro-cyber": "https://cybercx.com.au",
  "syd-afterpay": "https://www.afterpay.com",
  "mel-xero-mel": "https://www.xero.com",
  "mel-sensis-digital": "https://www.sensis.com.au",
  "mel-1password-mel": "https://1password.com",
  "mel-anzx-innovation": "https://www.anz.com.au",
  "mel-montu": "https://montu.com.au",
  "mel-lendi": "https://www.lendi.com.au",
  "mel-eucalyptus-mel": "https://eucalyptus.vc",
  "mel-hubspot-mel": "https://www.hubspot.com",
  "mel-better-caring": "https://mable.com.au",
  "mel-ordermentum": "https://www.ordermentum.com",
  "mel-forethought": "https://www.forethought.com.au",
  "mel-coinspot": "https://www.coinspot.com.au",
  "mel-swipe-crypto": "https://swyftx.com",
  "mel-grok-learning": "https://groklearning.com",
  "mel-wisr": "https://www.wisr.com.au",
  "mel-the-iconic-mel": "https://www.theiconic.com.au",
  "mel-goget-mel": "https://www.goget.com.au",
  "mel-kiwi-rails": "https://buildkite.com",
  "mel-spriggy": "https://www.spriggy.com.au",
  "mel-zeller": "https://www.myzeller.com",
  "adl-fleet-space": "https://fleetspace.com",
  "adl-agriwebb-adl": "https://www.agriwebb.com",
  "adl-insurtech": "https://covergenius.com",
  "adl-cloud-services": "https://vaultcloud.com.au",
  "adl-myriota": "https://myriota.com",
  "adl-fivecast": "https://www.fivecast.com",
  "adl-aurizn": "https://www.aurizn.com",
  "adl-lbt-innovations": "https://www.lbtinnovations.com",
  "per-healthengine": "https://healthengine.com.au",
  "per-nearmap-per": "https://www.nearmap.com",
  "per-lynn-tech": "https://lynasrareearths.com",
  "per-woodside-digital": "https://www.woodside.com",
  "per-bhp-tech": "https://www.bhp.com",
  "per-rio-tech": "https://www.riotinto.com",
  "per-fortescue-future": "https://www.fortescue.com",
  "per-security": "https://cybercx.com.au",
  "per-telethon-kids-tech": "https://www.telethonkids.org.au",
  tritium: "https://tritiumcharging.com",
  skedulo: "https://skedulo.com",
  "vault-cloud": "https://vaultcloud.com.au",
  "syd-atlassian": "https://www.atlassian.com",
  "syd-freelancer": "https://www.freelancer.com",
  "syd-hipages": "https://hipages.com.au",
  "syd-canva": "https://www.canva.com",
};

/** Direct high-quality logo URLs when aggregators/scrapers miss. */
const LOGO_URL_BY_ID = {
  skedulo: "https://skedulo.com/favicons/apple-touch-icon.png",
  "mel-kiwi-rails": "https://buildkite.com/_site/favicon.png",
  "syd-halon": "https://halon.io/hubfs/favicon.png",
  "syd-hipages": "https://icon.horse/icon/hipages.com.au",
  "per-rio-tech":
    "https://www.riotinto.com/-/media/project/riotinto/shared/favicon-32x32-new.png",
};

/** Domain overrides when the company website host is wrong for logos. */
const DOMAIN_BY_ID = {
  "syd-zenobe": "hismileteeth.com",
  "syd-tyro-health": "healthmatch.io",
  "syd-tyro-labs": "reejig.com",
  "syd-protecht": "talon.one",
  "syd-paymentwall-au": "chargefox.com",
  "syd-lovewell": "healthengine.com.au",
  "syd-better-caring": "mable.com.au",
  "mel-better-caring": "mable.com.au",
  "mel-kiwi-rails": "buildkite.com",
  "mel-swipe-crypto": "swyftx.com",
  "adl-insurtech": "covergenius.com",
  "per-security": "cybercx.com.au",
  "syd-tyro-cyber": "cybercx.com.au",
};

function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function resolveDomain(startup) {
  if (DOMAIN_BY_ID[startup.id]) return DOMAIN_BY_ID[startup.id];
  return domainFromWebsite(startup.website);
}

function absoluteUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/** Pull apple-touch / large favicon URLs from the live website HTML. */
async function scrapeSiteIconUrls(domain) {
  const origins = [`https://${domain}`, `https://www.${domain}`];
  const found = [];
  for (const origin of origins) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(origin, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AustralianStartupMapLogoFetcher/2.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = await res.text();
      const base = res.url || origin;
      const tags = html.match(/<link\b[^>]*>/gi) || [];
      for (const tag of tags) {
        const rel = (tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "";
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        if (!href) continue;
        const relL = rel.toLowerCase();
        if (
          !relL.includes("icon") &&
          !relL.includes("apple-touch") &&
          !relL.includes("shortcut")
        ) {
          continue;
        }
        if (relL.includes("mask-icon")) continue;
        const abs = absoluteUrl(base, href);
        if (abs) found.push({ rel: relL, href: abs });
      }
      // Prefer apple-touch then larger png favicons
      found.sort((a, b) => {
        const score = (x) =>
          (x.rel.includes("apple-touch") ? 100 : 0) +
          (x.href.includes("180") ? 40 : 0) +
          (x.href.includes("192") ? 35 : 0) +
          (x.href.includes("128") ? 20 : 0) +
          (x.href.includes("32") ? 5 : 0) +
          (x.href.endsWith(".png") ? 10 : 0) -
          (x.href.endsWith(".ico") ? 5 : 0) -
          (x.href.endsWith(".svg") ? 50 : 0);
        return score(b) - score(a);
      });
      if (found.length) return found.map((f) => f.href);
    } catch {
      // try next origin
    }
  }
  // Common well-known paths as last resort
  return [
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
    `https://www.${domain}/apple-touch-icon.png`,
    `https://${domain}/favicon-196x196.png`,
    `https://${domain}/favicon-192x192.png`,
    `https://${domain}/favicon-128x128.png`,
  ];
}

async function sourcesForDomain(domain) {
  const urls = [];
  if (LOGO_DEV_TOKEN) {
    urls.push(
      `https://img.logo.dev/${domain}?token=${encodeURIComponent(LOGO_DEV_TOKEN)}&size=128&format=png&fallback=404`,
      `https://img.logo.dev/${domain}?token=${encodeURIComponent(LOGO_DEV_TOKEN)}&size=256&format=png&fallback=404`,
    );
  }
  // Site-native icons often beat aggregators for AU brands
  const siteIcons = await scrapeSiteIconUrls(domain);
  urls.push(...siteIcons);
  urls.push(
    `https://icon.horse/icon/${domain}`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=256`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=128`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://unavatar.io/${domain}?fallback=false`,
    `https://unavatar.io/google/${domain}`,
    `https://unavatar.io/duckduckgo/${domain}`,
    `https://logo.clearbit.com/${domain}`,
  );
  return [...new Set(urls)];
}

function isSvg(buf) {
  const head = buf.slice(0, 256).toString("utf8").trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml") || head.includes("<svg ");
}

function isHtml(buf) {
  const head = buf.slice(0, 256).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html") || head.includes("<head");
}

function pngDimensions(buf) {
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    return null;
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (!width || !height || width > 4096 || height > 4096) return null;
  return { width, height };
}

function isAcceptableImage(buf) {
  if (!buf || buf.length < ABS_MIN_BYTES) return false;
  if (isSvg(buf) || isHtml(buf)) return false;
  const dims = pngDimensions(buf);
  if (dims) {
    return dims.width >= MIN_PX && dims.height >= MIN_PX;
  }
  // Windows ICO
  if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) {
    return buf.length >= 250;
  }
  // JPEG / WEBP / other raster
  return buf.length >= MIN_BYTES;
}

function existingIsGood(filePath) {
  if (!fs.existsSync(filePath)) return false;
  return isAcceptableImage(fs.readFileSync(filePath));
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "AustralianStartupMapLogoFetcher/2.0",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").toLowerCase();
    if (type.includes("text/html") || type.includes("application/json")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isAcceptableImage(buf)) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadLogo(startup) {
  const out = path.join(logosDir, `${startup.id}.png`);
  if (existingIsGood(out)) {
    return { status: "exists", file: out };
  }

  if (fs.existsSync(out)) {
    fs.unlinkSync(out);
  }

  const domain = resolveDomain(startup);
  if (!domain && !LOGO_URL_BY_ID[startup.id]) return { status: "no-domain" };

  const sources = [];
  if (LOGO_URL_BY_ID[startup.id]) sources.push(LOGO_URL_BY_ID[startup.id]);
  if (domain) sources.push(...(await sourcesForDomain(domain)));

  for (const url of [...new Set(sources)]) {
    const buf = await fetchImage(url);
    if (!buf) {
      await sleep(60);
      continue;
    }
    fs.writeFileSync(out, buf);
    return { status: "saved", file: out, source: url, bytes: buf.length };
  }
  return { status: "miss" };
}

async function main() {
  const cities = ["brisbane", "sydney", "melbourne", "adelaide", "perth"];
  let saved = 0;
  let exists = 0;
  let miss = 0;
  let websitesAdded = 0;

  // With --force, drop every existing logo so quality gate re-evaluates via re-download
  if (force) {
    for (const f of fs.readdirSync(logosDir)) {
      if (!f.endsWith(".png")) continue;
      const full = path.join(logosDir, f);
      if (!existingIsGood(full)) fs.unlinkSync(full);
    }
  }

  for (const city of cities) {
    const file = path.join(root, "src", "data", "startups", `${city}.json`);
    const startups = JSON.parse(fs.readFileSync(file, "utf8"));
    let dirty = false;

    for (const s of startups) {
      if (!s.website && WEBSITE_BY_ID[s.id]) {
        s.website = WEBSITE_BY_ID[s.id];
        dirty = true;
        websitesAdded++;
      }

      const result = await downloadLogo(s);
      if (result.status === "saved") {
        saved++;
        s.logoUrl = `/logos/${s.id}.png`;
        dirty = true;
        process.stdout.write(`+ ${s.id} (${result.bytes}b)\n`);
      } else if (result.status === "exists") {
        exists++;
        if (s.website) {
          s.logoUrl = `/logos/${s.id}.png`;
          dirty = true;
        }
      } else {
        miss++;
        if (s.website) {
          const domain = resolveDomain(s);
          if (domain) {
            s.logoUrl = `https://icon.horse/icon/${domain}`;
            dirty = true;
          }
        } else if (s.logoUrl) {
          delete s.logoUrl;
          dirty = true;
        }
        process.stdout.write(`x ${s.id}\n`);
      }
      await sleep(60);
    }

    if (dirty) {
      fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
    }
  }

  const good = fs
    .readdirSync(logosDir)
    .filter((f) => f.endsWith(".png") && existingIsGood(path.join(logosDir, f))).length;

  console.log(
    JSON.stringify(
      { saved, exists, miss, websitesAdded, goodLocalLogos: good, logosDir, force },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
