/**
 * Download best-available logos into public/logos/{id}.png
 * and attach websites for known brands missing them.
 *
 * Usage: node scripts/download-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const logosDir = path.join(root, "public", "logos");
fs.mkdirSync(logosDir, { recursive: true });

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
  "adl-fleet-space": "https://fleetspace.com",
  "adl-agriwebb-adl": "https://www.agriwebb.com",
  "adl-insurtech": "https://covergenius.com",
  "adl-cloud-services": "https://vaultcloud.com.au",
  "per-healthengine": "https://healthengine.com.au",
  "per-nearmap-per": "https://www.nearmap.com",
  "per-lynn-tech": "https://lynasrareearths.com",
  "per-woodside-digital": "https://www.woodside.com",
  "per-bhp-tech": "https://www.bhp.com",
  "per-rio-tech": "https://www.riotinto.com",
  "per-fortescue-future": "https://www.fortescue.com",
  "per-security": "https://cybercx.com.au",
  "per-telethon-kids-tech": "https://www.telethonkids.org.au",
};

function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function guessWebsiteFromName(name) {
  const cleaned = name
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "")
    .toLowerCase();
  if (!cleaned || cleaned.length < 3) return null;
  // Only use for plausible brand-like names without spaces already collapsed
  return `https://${cleaned}.com`;
}

function sourcesForDomain(domain) {
  return [
    `https://unavatar.io/${domain}?fallback=false`,
    `https://unavatar.io/google/${domain}`,
    `https://logo.clearbit.com/${domain}`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=128`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://unavatar.io/duckduckgo/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
}

async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "AustralianStartupMapLogoFetcher/1.0",
        Accept: "image/*,*/*",
      },
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("image") && !type.includes("octet-stream")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Skip tiny placeholder/error images
    if (buf.length < 80) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadLogo(startup) {
  const out = path.join(logosDir, `${startup.id}.png`);
  if (fs.existsSync(out) && fs.statSync(out).size > 80) {
    return { status: "exists", file: out };
  }
  const domain = domainFromWebsite(startup.website);
  if (!domain) return { status: "no-domain" };

  for (const url of sourcesForDomain(domain)) {
    const buf = await fetchImage(url);
    if (!buf) continue;
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
      // For remaining named brands with a clear .com identity, light guess only if name looks like a brand
      if (!s.website && !/\b(illustrative|office|AU|SA|WA|tech hub)\b/i.test(s.name)) {
        const guess = guessWebsiteFromName(s.name);
        // Don't apply aggressive guesses — leave illustrative placeholders alone
      }

      if (s.website) {
        const domain = domainFromWebsite(s.website);
        if (domain) {
          s.logoUrl = `/logos/${s.id}.png`;
          dirty = true;
        }
      }

      const result = await downloadLogo(s);
      if (result.status === "saved") {
        saved++;
        process.stdout.write(`+ ${s.id}\n`);
      } else if (result.status === "exists") {
        exists++;
      } else if (result.status === "miss" || result.status === "no-domain") {
        miss++;
        // Fall back to remote URL rather than a broken local path
        if (s.website) {
          const domain = domainFromWebsite(s.website);
          if (domain) {
            s.logoUrl = `https://unavatar.io/${domain}`;
            dirty = true;
          }
        } else {
          delete s.logoUrl;
          dirty = true;
        }
        process.stdout.write(`x ${s.id}\n`);
      }
    }

    if (dirty) {
      fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
    }
  }

  console.log(
    JSON.stringify({ saved, exists, miss, websitesAdded, logosDir }, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
