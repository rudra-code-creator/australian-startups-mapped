import fs from "node:fs";

function websiteAssets(website) {
  const host = new URL(website).hostname.replace(/^www\./, "");
  return {
    logoUrl: `https://logo.clearbit.com/${host}`,
    imageUrls: [
      `https://s0.wp.com/mshots/v1/${encodeURIComponent(website)}?w=1200`,
    ],
  };
}

const precinct = {
  buildingId: "brisbane-the-precinct",
  buildingName: "The Precinct",
  address: "100 Brunswick St, Fortitude Valley QLD 4006",
  lat: -27.4576,
  lng: 153.0338,
};

const bnePath = "src/data/startups/brisbane.json";
const bne = JSON.parse(fs.readFileSync(bnePath, "utf8"));

const chat = bne.find((s) => s.id === "chatstat");
Object.assign(chat, {
  ...precinct,
  lat: precinct.lat + 0.0001,
  lng: precinct.lng + 0.00005,
  website: "https://chatstat.com",
  sector: "Safety",
  blurb:
    "Digital wellbeing and safety platform for schools, families, and workplaces — monitoring communication signals that matter.",
  ...websiteAssets("https://chatstat.com"),
});

const tanda = bne.find((s) => s.id === "tanda");
Object.assign(tanda, {
  website: "https://tanda.com.au",
  address: tanda.address || "120 Edward St, Brisbane City QLD 4000",
  blurb:
    "Workforce management, rostering, and time-tracking software for Australian businesses.",
  ...websiteAssets("https://tanda.com.au"),
});

if (!bne.some((s) => s.id === "autorfp")) {
  bne.push({
    id: "autorfp",
    name: "AutoRFP.ai",
    city: "brisbane",
    lat: -27.4675,
    lng: 153.0205,
    website: "https://autorfp.ai",
    sector: "AI / Sales",
    address: "Brisbane City QLD 4000",
    blurb:
      "AI-first RFP and security questionnaire platform that drafts trusted, cited responses so teams win more deals faster.",
    ...websiteAssets("https://autorfp.ai"),
  });
}

fs.writeFileSync(bnePath, JSON.stringify(bne, null, 2) + "\n");

const sydPath = "src/data/startups/sydney.json";
const syd = JSON.parse(fs.readFileSync(sydPath, "utf8"));

if (!syd.some((s) => s.id === "syd-lyra")) {
  syd.push({
    id: "syd-lyra",
    name: "Lyra Technologies",
    city: "sydney",
    lat: -33.8576401,
    lng: 151.2041914,
    website: "https://lyratechnologies.com.au",
    sector: "Product Engineering",
    address: "7/20 Windmill St, Millers Point NSW 2000",
    blurb:
      "Founding engineering and design studio partnering with Silicon Valley startups to design, build, and ship products.",
    ...websiteAssets("https://lyratechnologies.com.au"),
  });
}

if (!syd.some((s) => s.id === "syd-kinso")) {
  syd.push({
    id: "syd-kinso",
    name: "Kinso",
    city: "sydney",
    lat: -33.8773931,
    lng: 151.2123847,
    website: "https://kinso.ai",
    sector: "AI / Productivity",
    address: "1 Oxford St, Surry Hills NSW 2010",
    blurb:
      "Unified AI inbox that brings email, messages, and contacts into one workspace and drafts replies in your voice.",
    ...websiteAssets("https://kinso.ai"),
  });
}

fs.writeFileSync(sydPath, JSON.stringify(syd, null, 2) + "\n");

const melPath = "src/data/startups/melbourne.json";
const mel = JSON.parse(fs.readFileSync(melPath, "utf8"));

if (!mel.some((s) => s.id === "mel-lyra")) {
  mel.push({
    id: "mel-lyra",
    name: "Lyra Technologies",
    city: "melbourne",
    lat: -37.8137562,
    lng: 144.9722943,
    website: "https://lyratechnologies.com.au",
    sector: "Product Engineering",
    address: "7/440 Collins St, Melbourne VIC 3000",
    blurb:
      "Melbourne studio of Lyra Technologies — embedded engineering and design for high-growth startups.",
    ...websiteAssets("https://lyratechnologies.com.au"),
  });
}

fs.writeFileSync(melPath, JSON.stringify(mel, null, 2) + "\n");

const hub = bne.filter((s) => s.buildingId === "brisbane-the-precinct");
console.log(
  "precinct:",
  hub.map((s) => s.name).join(", "),
);
console.log(
  "added:",
  {
    autorfp: bne.some((s) => s.id === "autorfp"),
    lyraSyd: syd.some((s) => s.id === "syd-lyra"),
    kinso: syd.some((s) => s.id === "syd-kinso"),
    lyraMel: mel.some((s) => s.id === "mel-lyra"),
    chatstatWeb: chat.website,
    tandaWeb: tanda.website,
  },
);
