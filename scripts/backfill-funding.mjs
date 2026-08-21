/**
 * Adds fundingStage to every startup seed JSON (curated where known, else
 * a stable illustrative assignment). Usage: node scripts/backfill-funding.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const startupsDir = path.resolve(__dirname, "..", "src", "data", "startups");

const STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D+",
  "Growth",
  "Public",
  "Bootstrapped",
];

/** Known / illustrative latest stage overrides by startup id. */
const KNOWN = {
  // Australia
  canva: "Public",
  atlassian: "Public",
  afterpay: "Public",
  zip: "Public",
  airwallex: "Series D+",
  cultureamp: "Series D+",
  "culture-amp": "Series D+",
  go1: "Series D+",
  "safety-culture": "Series D+",
  safetyculture: "Series D+",
  employmenthero: "Series D+",
  "employment-hero": "Series D+",
  linktree: "Series C",
  immutable: "Series D+",
  brighte: "Series C",
  deputy: "Series C",
  envato: "Bootstrapped",
  seek: "Public",
  rea: "Public",
  carsales: "Public",
  xero: "Public",
  // NZ
  "akl-xero": "Public",
  "wlg-xero": "Public",
  "akl-rocket-lab": "Public",
  "akl-mega": "Growth",
  "akl-serato": "Growth",
  "akl-sharesies-akl": "Series C",
  "wlg-sharesies": "Series C",
  "wlg-trademe": "Public",
  // Singapore / SEA
  "sg-grab": "Public",
  "sg-sea": "Public",
  "sg-shopee": "Public",
  "sg-carousell": "Series D+",
  "sg-nium": "Series D+",
  "sg-ninjavan": "Series D+",
  "sg-lazada": "Public",
  "sg-tiktok": "Public",
  "jkt-gojek": "Public",
  "jkt-goto": "Public",
  "jkt-tokopedia": "Public",
  "jkt-traveloka": "Series D+",
  "jkt-xendit": "Series D+",
  // Malaysia
  "kv-grab": "Public",
  "kv-carsome": "Series D+",
  "kv-tng": "Growth",
  "kv-shopee": "Public",
};

function hashStage(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // Bias toward Seed–Series C for unnamed listings
  const pool = [
    "Seed",
    "Seed",
    "Series A",
    "Series A",
    "Series B",
    "Series B",
    "Series C",
    "Series D+",
    "Growth",
    "Bootstrapped",
    "Public",
    "Pre-seed",
  ];
  return pool[h % pool.length];
}

function inferFromName(name, sector) {
  const n = (name || "").toLowerCase();
  const s = (sector || "").toLowerCase();
  if (
    n.includes("bank") ||
    n.includes("telecom") ||
    n.includes("university") ||
    n.includes("port ") ||
    s === "hub" ||
    n.includes("hub") ||
    n.includes("park")
  ) {
    if (s === "hub" || n.includes("hub") || n.includes("park") || n.includes("university")) {
      return "Bootstrapped";
    }
  }
  if (
    n.includes("microsoft") ||
    n.includes("google") ||
    n.includes("amazon") ||
    n.includes("meta") ||
    n.includes("infosys") ||
    n.includes("tcs") ||
    n.includes("wipro") ||
    n.includes("cognizant") ||
    n.includes("accenture") ||
    n.includes("capgemini")
  ) {
    return "Public";
  }
  return null;
}

let updated = 0;
let already = 0;

for (const file of fs.readdirSync(startupsDir).filter((f) => f.endsWith(".json"))) {
  const full = path.join(startupsDir, file);
  const startups = JSON.parse(fs.readFileSync(full, "utf8"));
  let changed = false;
  for (const s of startups) {
    if (s.fundingStage && STAGES.includes(s.fundingStage)) {
      already += 1;
      continue;
    }
    const fromKnown = KNOWN[s.id];
    const fromName = inferFromName(s.name, s.sector);
    s.fundingStage = fromKnown || fromName || hashStage(s.id);
    if (!STAGES.includes(s.fundingStage)) s.fundingStage = "Series A";
    changed = true;
    updated += 1;
  }
  if (changed) {
    fs.writeFileSync(full, JSON.stringify(startups, null, 2) + "\n");
  }
}

console.log(`funding backfill: updated ${updated}, kept ${already}`);
