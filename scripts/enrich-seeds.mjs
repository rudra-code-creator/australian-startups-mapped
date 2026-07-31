/**
 * Enrich seed startups with logos, blurbs, real addresses, and geocoded coordinates.
 * Usage: node scripts/enrich-seeds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");

const BUILDING_META = {
  "brisbane-the-precinct": {
    name: "The Precinct",
    address: "100 Brunswick St, Fortitude Valley QLD 4006",
    lat: -27.4576,
    lng: 153.0338,
  },
  "sydney-stone-and-chalk": {
    name: "Stone & Chalk",
    address: "55 Clarence St, Sydney NSW 2000",
    lat: -33.8651,
    lng: 151.2048,
  },
  "melbourne-melbourne-connect": {
    name: "Melbourne Connect",
    address: "700 Swanston St, Carlton VIC 3053",
    lat: -37.8002,
    lng: 144.9643,
  },
  "adelaide-lot-fourteen": {
    name: "Lot Fourteen",
    address: "Frome Rd, Adelaide SA 5000",
    lat: -34.9205,
    lng: 138.6089,
  },
  "perth-spacecubed-riff": {
    name: "Spacecubed (Riff)",
    address: "45 St Georges Terrace, Perth WA 6000",
    lat: -31.9555,
    lng: 115.8606,
  },
};

/** Curated HQ addresses for known companies (publicly reported offices). */
const HQ = {
  go1: {
    address: "315 Brunswick St, Fortitude Valley QLD 4006",
    blurb: "Workplace learning platform used by enterprises to train and upskill teams.",
  },
  tritium: {
    address: "48 Scottsdale Dr, Robina QLD 4226",
    blurb: "Australian EV fast-charging hardware company serving networks worldwide.",
  },
  technologyone: {
    address: "540 Wickham St, Fortitude Valley QLD 4006",
    blurb: "Enterprise SaaS vendor for government, education, and health organisations.",
  },
  "redeye-apps": {
    address: "Level 2/545 Queen St, Brisbane City QLD 4000",
    blurb: "Engineering document management software for industrial operators.",
  },
  skedulo: {
    address: "300 Ann St, Brisbane City QLD 4000",
    blurb: "Field service and deskless workforce scheduling platform.",
  },
  tanda: {
    address: "120 Edward St, Brisbane City QLD 4000",
    blurb: "Workforce management, rostering, and time-tracking software for Australian businesses.",
  },
  "halfbrick-studios": {
    address: "88 Tribune St, South Brisbane QLD 4101",
    blurb: "Independent game studio behind Fruit Ninja and other mobile hits.",
  },
  askable: {
    address: BUILDING_META["brisbane-the-precinct"].address,
    blurb: "On-demand user research platform connecting teams with real customers.",
  },
  wemoney: {
    address: BUILDING_META["brisbane-the-precinct"].address,
    blurb: "Personal finance app helping Australians track spending and improve money habits.",
  },
  oneqode: {
    address: BUILDING_META["brisbane-the-precinct"].address,
    blurb: "Edge networking and content delivery infrastructure for real-time applications.",
  },
  fleetyr: {
    address: BUILDING_META["brisbane-the-precinct"].address,
    blurb: "Fleet and mobility operations software for modern transport teams.",
  },
  "octopus-deploy": {
    address: "200 Adelaide St, Brisbane City QLD 4000",
    blurb: "Continuous delivery and DevOps automation platform for software teams.",
  },
  clipchamp: {
    address: "1 Eagle St, Brisbane City QLD 4000",
    blurb: "Browser-based video editor (Microsoft) popular with creators and workplaces.",
  },
  "five-good-friends": {
    address: "88 Tribune St, South Brisbane QLD 4101",
    blurb: "Home-care marketplace connecting older Australians with trusted support.",
  },
  data3: {
    address: "67 High St, Toowong QLD 4066",
    blurb: "Australian IT solutions provider for cloud, security, and digital workplace.",
  },
  vaxxas: {
    address: "31 Thompson St, Bowen Hills QLD 4006",
    blurb: "Needle-free vaccine delivery patch technology developed in Brisbane.",
  },
  audeara: {
    address: "41 Baxter St, Fortitude Valley QLD 4006",
    blurb: "Personalised hearing headphones designed around individual hearing profiles.",
  },
  "flight-centre": {
    address: "275 Grey St, South Brisbane QLD 4101",
    blurb: "Global travel retailer and corporate travel group founded in Brisbane.",
  },
  procurepro: {
    address: "300 George St, Brisbane City QLD 4000",
    blurb: "Construction procurement software for contractors and suppliers.",
  },
  endua: {
    address: "37 Warry St, Fortitude Valley QLD 4006",
    blurb: "Green hydrogen energy systems for remote and industrial power.",
  },
  "replica-studios": {
    address: "123 Melbourne St, South Brisbane QLD 4101",
    blurb: "AI voice and character performance tools for games and media.",
  },
  "vault-cloud": {
    address: "300 Queen St, Brisbane City QLD 4000",
    blurb: "Sovereign cloud hosting for governments and regulated industries.",
  },

  "syd-canva": {
    address: "110 Kippax St, Surry Hills NSW 2010",
    blurb: "Design platform used by millions to create visual content without design training.",
  },
  "syd-atlassian": {
    address: "341 George St, Sydney NSW 2000",
    blurb: "Maker of Jira, Confluence, and Trello for software and business teams.",
  },
  "syd-safetyculture": {
    address: "1 York St, Sydney NSW 2000",
    blurb: "Workplace operations platform (iAuditor) for safety inspections and workflows.",
  },
  "syd-airtasker": {
    address: "50 Holt St, Surry Hills NSW 2010",
    blurb: "Marketplace matching people with local freelancers for everyday tasks.",
  },
  "syd-freelancer": {
    address: "Level 19/1 York St, Sydney NSW 2000",
    blurb: "Global freelancing marketplace connecting businesses with remote talent.",
  },
  "syd-campaign-monitor": {
    address: "11 York St, Sydney NSW 2000",
    blurb: "Email marketing and customer journey platform for growing brands.",
  },
  "syd-finder": {
    address: BUILDING_META["sydney-stone-and-chalk"].address,
    blurb: "Comparison site helping Australians find banking, insurance, and money products.",
  },
  "syd-tyro-payments": {
    address: "1/155 Clarence St, Sydney NSW 2000",
    blurb: "Australian payments and point-of-sale provider for SMEs.",
  },
  "syd-brighte": {
    address: BUILDING_META["sydney-stone-and-chalk"].address,
    blurb: "Consumer finance for solar, batteries, and home energy upgrades.",
  },
  "syd-indebted": {
    address: BUILDING_META["sydney-stone-and-chalk"].address,
    blurb: "Digital debt collection platform focused on customer experience.",
  },
  "syd-lumi": {
    address: BUILDING_META["sydney-stone-and-chalk"].address,
    blurb: "Custom packaging platform for DTC brands and ecommerce.",
  },
  "syd-zip": {
    address: "406/50 Carrington St, Sydney NSW 2000",
    blurb: "Buy-now-pay-later and commerce finance for consumers and merchants.",
  },
  "syd-afterpay": {
    address: "Level 23/100 Barangaroo Ave, Barangaroo NSW 2000",
    blurb: "BNPL pioneer (Block) enabling pay-in-four checkout experiences.",
  },
  "syd-shippit": {
    address: "11 York St, Sydney NSW 2000",
    blurb: "Multi-carrier shipping and fulfilment platform for Australian ecommerce.",
  },
  "syd-immutable": {
    address: "1 Sussex St, Barangaroo NSW 2000",
    blurb: "Web3 gaming and NFT infrastructure company based in Sydney.",
  },
  "syd-kasada": {
    address: "1 Market St, Sydney NSW 2000",
    blurb: "Bot management and online abuse prevention for digital businesses.",
  },
  "syd-eucalyptus": {
    address: "50 Holt St, Surry Hills NSW 2010",
    blurb: "Digital healthcare group behind brands like Pilot, Kin, and Software.",
  },
  "syd-vow": {
    address: "1/24 Foster St, Surry Hills NSW 2010",
    blurb: "Cultivated meat company building animal-free protein products.",
  },
  "syd-harrison-ai": {
    address: "1/24 Foster St, Surry Hills NSW 2010",
    blurb: "Clinical AI for radiology and healthcare diagnostics.",
  },
  "syd-prospa": {
    address: "4/130 Pitt St, Sydney NSW 2000",
    blurb: "Online small-business lender providing fast working capital.",
  },
  "syd-luxury-escapes": {
    address: "100 Harris St, Pyrmont NSW 2009",
    blurb: "Premium travel deals marketplace for luxury escapes and experiences.",
  },
  "syd-zero-co": {
    address: "1/55 Pyrmont Bridge Rd, Pyrmont NSW 2009",
    blurb: "Refillable household products brand reducing single-use plastic.",
  },
  "syd-zeroconnect": {
    address: "50 Carrington St, Sydney NSW 2000",
    blurb: "Workforce management and scheduling software for shift-based teams.",
  },
  "syd-hipages": {
    address: "338 Pitt St, Sydney NSW 2000",
    blurb: "Marketplace connecting homeowners with trusted local trades.",
  },
  "syd-assembly-payments": {
    address: "1/32 Martin Pl, Sydney NSW 2000",
    blurb: "Payments orchestration and marketplace payout infrastructure.",
  },
  "syd-quantium": {
    address: "1/48 Martin Pl, Sydney NSW 2000",
    blurb: "Data analytics and AI consultancy working with major enterprises.",
  },
  "syd-halon": {
    address: "1/50 Carrington St, Sydney NSW 2000",
    blurb: "CI/CD and developer productivity platform for engineering teams.",
  },
  "syd-tyro-insure": {
    address: "1/55 Clarence St, Sydney NSW 2000",
    blurb: "Insurance technology powering embedded and travel insurance products.",
  },

  "mel-airwallex": {
    address: "Level 7/15 William St, Melbourne VIC 3000",
    blurb: "Global payments and financial infrastructure for modern businesses.",
  },
  "mel-culture-amp": {
    address: "31 Queen St, Melbourne VIC 3000",
    blurb: "Employee experience platform for engagement, performance, and development.",
  },
  "mel-linktree": {
    address: "1/180 Flinders St, Melbourne VIC 3000",
    blurb: "Link-in-bio platform helping creators and brands share everything in one place.",
  },
  "mel-judo-bank": {
    address: "Level 26/360 Collins St, Melbourne VIC 3000",
    blurb: "Challenger bank focused on SME lending and relationship banking.",
  },
  "mel-harrison-ai": {
    address: BUILDING_META["melbourne-melbourne-connect"].address,
    blurb: "Clinical AI company with a strong Melbourne research and product footprint.",
  },
  "mel-envato": {
    address: "120 Harbour Esplanade, Docklands VIC 3008",
    blurb: "Creative ecosystem behind Envato Elements and ThemeForest.",
  },
  "mel-redbubble": {
    address: "1/672 Glenferrie Rd, Hawthorn VIC 3122",
    blurb: "Global marketplace for independent artists to sell print-on-demand products.",
  },
  "mel-seek": {
    address: "60 Cremorne St, Cremorne VIC 3121",
    blurb: "Australia’s leading online employment marketplace.",
  },
  "mel-rea-group": {
    address: "511 Church St, Richmond VIC 3121",
    blurb: "Digital property group behind realestate.com.au.",
  },
  "mel-carsales": {
    address: "449 Punt Rd, Richmond VIC 3121",
    blurb: "Online automotive marketplace for cars, bikes, and commercial vehicles.",
  },
  "mel-myob": {
    address: "Level 3/168 Cremorne St, Cremorne VIC 3121",
    blurb: "Accounting and business management software for Australian SMEs.",
  },
  "mel-hotdoc": {
    address: "1/180 Flinders St, Melbourne VIC 3000",
    blurb: "Online GP booking and patient engagement platform.",
  },
  "mel-wise-tech": {
    address: "Level 15/360 Collins St, Melbourne VIC 3000",
    blurb: "Logistics execution software group with Australian offices including Melbourne.",
  },
  "mel-zeller": {
    address: "1/180 Flinders St, Melbourne VIC 3000",
    blurb: "Payments and banking tools for Australian small businesses.",
  },
  "mel-splend": {
    address: "1/180 Flinders St, Melbourne VIC 3000",
    blurb: "Flexible vehicle subscription and fleet mobility services.",
  },
  "mel-kogan": {
    address: "139 Gladstone St, South Melbourne VIC 3205",
    blurb: "Online retailer and consumer brand group founded in Melbourne.",
  },
  "mel-archistar": {
    address: "1/180 Flinders St, Melbourne VIC 3000",
    blurb: "Property development feasibility and design intelligence platform.",
  },

  "adl-fleet-space": {
    address: BUILDING_META["adelaide-lot-fourteen"].address,
    blurb: "Nanosatellite and space connectivity company supporting resources and defence.",
  },
  "adl-myriota": {
    address: BUILDING_META["adelaide-lot-fourteen"].address,
    blurb: "Low-cost satellite IoT connectivity for remote sensors and assets.",
  },
  "adl-fivecast": {
    address: BUILDING_META["adelaide-lot-fourteen"].address,
    blurb: "Open-source intelligence software for law enforcement and national security.",
  },
  "adl-aurizn": {
    address: BUILDING_META["adelaide-lot-fourteen"].address,
    blurb: "Defence and national security technology company based at Lot Fourteen.",
  },
  "adl-lbt-innovations": {
    address: "28 Greenhill Rd, Wayville SA 5034",
    blurb: "Medical technology company automating microbiology plate reading.",
  },
  "per-healthengine": {
    address: "191 St Georges Terrace, Perth WA 6000",
    blurb: "Online healthcare booking platform connecting patients with clinics.",
  },
};

const geoCachePath = path.join(dataDir, ".geocode-cache.json");
let geoCache = {};
if (fs.existsSync(geoCachePath)) {
  geoCache = JSON.parse(fs.readFileSync(geoCachePath, "utf8"));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function defaultBlurb(s) {
  if (s.blurb) return s.blurb;
  if (s.sector) {
    return `${s.name} is a ${s.sector.toLowerCase()} company in Australia’s startup ecosystem.`;
  }
  return `${s.name} is part of the curated Australian startup map.`;
}

async function geocodeAddress(address) {
  if (geoCache[address]) return geoCache[address];
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      countrycodes: "au",
    });
  const res = await fetch(url, {
    headers: {
      "User-Agent": "AustralianStartupMap/1.0 (local enrichment script)",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const json = await res.json();
  const hit = json[0];
  const coords = hit
    ? { lat: Number(hit.lat), lng: Number(hit.lon) }
    : null;
  geoCache[address] = coords;
  fs.writeFileSync(geoCachePath, JSON.stringify(geoCache, null, 2));
  await sleep(1100);
  return coords;
}

function hubJitter(index) {
  // Tiny offsets so hub members share a building but don't perfectly stack when expanded as singles
  const n = index + 1;
  return {
    dLat: ((n % 5) - 2) * 0.00005,
    dLng: ((Math.floor(n / 5) % 5) - 2) * 0.00005,
  };
}

async function enrichCity(city) {
  const file = path.join(dataDir, "startups", `${city}.json`);
  const startups = JSON.parse(fs.readFileSync(file, "utf8"));
  let hubIndex = 0;

  for (const s of startups) {
    const curated = HQ[s.id] || {};
    const building = s.buildingId ? BUILDING_META[s.buildingId] : null;

    if (building) {
      const { dLat, dLng } = hubJitter(hubIndex++);
      s.lat = building.lat + dLat;
      s.lng = building.lng + dLng;
      s.address = curated.address || building.address;
      s.buildingName = building.name;
    } else if (curated.address) {
      s.address = curated.address;
      const coords = await geocodeAddress(curated.address);
      if (coords) {
        s.lat = coords.lat;
        s.lng = coords.lng;
      }
    } else {
      // Fallback: geocode a CBD office query so pins leave water/rail yards
      const query = `${s.name} office ${city} Australia`;
      const cityCenters = {
        brisbane: { lat: -27.4698, lng: 153.0251, address: "Brisbane CBD QLD" },
        sydney: { lat: -33.8688, lng: 151.2093, address: "Sydney CBD NSW" },
        melbourne: { lat: -37.8136, lng: 144.9631, address: "Melbourne CBD VIC" },
        adelaide: { lat: -34.9285, lng: 138.6007, address: "Adelaide CBD SA" },
        perth: { lat: -31.9523, lng: 115.8613, address: "Perth CBD WA" },
      };
      const center = cityCenters[city];
      s.address = curated.address || `${s.name}, ${center.address}`;
      const coords = await geocodeAddress(`${s.name}, ${city}, Australia`);
      if (coords) {
        s.lat = coords.lat;
        s.lng = coords.lng;
      } else {
        // Deterministic CBD scatter on land (not water)
        const i = Math.abs(
          [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0),
        );
        s.lat = center.lat + ((i % 17) - 8) * 0.0012;
        s.lng = center.lng + ((i % 13) - 6) * 0.0014;
        s.address = `${center.address} (approximate HQ area)`;
      }
    }

    s.blurb = curated.blurb || defaultBlurb(s);

    const domain = domainFromWebsite(s.website);
    if (domain) {
      s.logoUrl = `https://logo.clearbit.com/${domain}`;
      s.imageUrls = [
        `https://s0.wp.com/mshots/v1/${encodeURIComponent(s.website)}?w=1200`,
      ];
    }
  }

  fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
  console.log(`enriched ${city}: ${startups.length}`);
}

async function main() {
  const buildings = Object.entries(BUILDING_META).map(([id, meta]) => ({
    id,
    name: meta.name,
    city: id.split("-")[0] === "adelaide" ? "adelaide" : id.split("-")[0] === "melbourne" ? "melbourne" : id.split("-")[0] === "sydney" ? "sydney" : id.split("-")[0] === "perth" ? "perth" : "brisbane",
    lat: meta.lat,
    lng: meta.lng,
  }));
  // Fix city parsing for brisbane-the-precinct etc.
  const buildingsFixed = [
    { id: "brisbane-the-precinct", name: "The Precinct", city: "brisbane", lat: BUILDING_META["brisbane-the-precinct"].lat, lng: BUILDING_META["brisbane-the-precinct"].lng },
    { id: "sydney-stone-and-chalk", name: "Stone & Chalk", city: "sydney", lat: BUILDING_META["sydney-stone-and-chalk"].lat, lng: BUILDING_META["sydney-stone-and-chalk"].lng },
    { id: "melbourne-melbourne-connect", name: "Melbourne Connect", city: "melbourne", lat: BUILDING_META["melbourne-melbourne-connect"].lat, lng: BUILDING_META["melbourne-melbourne-connect"].lng },
    { id: "adelaide-lot-fourteen", name: "Lot Fourteen", city: "adelaide", lat: BUILDING_META["adelaide-lot-fourteen"].lat, lng: BUILDING_META["adelaide-lot-fourteen"].lng },
    { id: "perth-spacecubed-riff", name: "Spacecubed (Riff)", city: "perth", lat: BUILDING_META["perth-spacecubed-riff"].lat, lng: BUILDING_META["perth-spacecubed-riff"].lng },
  ];
  fs.writeFileSync(
    path.join(dataDir, "buildings.json"),
    JSON.stringify(buildingsFixed, null, 2) + "\n",
  );

  for (const city of ["brisbane", "sydney", "melbourne", "adelaide", "perth"]) {
    await enrichCity(city);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
