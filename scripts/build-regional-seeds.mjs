/**
 * Writes curated seed JSON for new regional cities and merges hub buildings.
 * Usage: node scripts/build-regional-seeds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const startupsDir = path.join(dataDir, "startups");

const BUILDINGS = {
  "auckland-gridakl": {
    name: "GridAKL",
    city: "auckland",
    lat: -36.84145,
    lng: 174.75625,
    address: "12 Madden St, Auckland CBD",
  },
  "auckland-icehouse": {
    name: "The Icehouse",
    city: "auckland",
    lat: -36.8509,
    lng: 174.7804,
    address: "The Strand, Parnell, Auckland",
  },
  "wellington-creative-hq": {
    name: "Creative HQ",
    city: "wellington",
    lat: -41.2926,
    lng: 174.7772,
    address: "7 Dixon St, Te Aro, Wellington",
  },
  "christchurch-epic": {
    name: "EPIC Innovation",
    city: "christchurch",
    lat: -43.5334,
    lng: 172.6398,
    address: "78 Manchester St, Christchurch Central",
  },
  "singapore-block71": {
    name: "BLOCK71",
    city: "singapore",
    lat: 1.2979,
    lng: 103.7876,
    address: "71 Ayer Rajah Crescent, Singapore 139951",
  },
  "singapore-launchpad": {
    name: "LaunchPad @ one-north",
    city: "singapore",
    lat: 1.2995,
    lng: 103.7871,
    address: "1 Fusionopolis Way, Singapore 138632",
  },
  "jakarta-scbd": {
    name: "SCBD Campus",
    city: "jakarta",
    lat: -6.225,
    lng: 106.809,
    address: "SCBD, Jl. Jend. Sudirman, Jakarta Selatan",
  },
  "bandung-digital-valley": {
    name: "Bandung Digital Valley",
    city: "bandung",
    lat: -6.9175,
    lng: 107.6191,
    address: "Jl. Gegerkalong Hilir, Bandung",
  },
  "yogyakarta-jdv": {
    name: "Jogja Digital Valley",
    city: "yogyakarta",
    lat: -7.7828,
    lng: 110.3671,
    address: "Jl. Laksda Adisucipto, Yogyakarta",
  },
  "batam-nongsa": {
    name: "Nongsa Digital Park",
    city: "batam",
    lat: 1.1855,
    lng: 104.0945,
    address: "Nongsa Digital Park, Batam",
  },
  "suva-innovation-hub": {
    name: "Fiji Innovation Hub",
    city: "suva",
    lat: -18.1416,
    lng: 178.4419,
    address: "Reserve Bank Building precinct, Suva",
  },
  "port-moresby-harbour-city": {
    name: "Harbour City",
    city: "port-moresby",
    lat: -9.4785,
    lng: 147.1492,
    address: "Harbour City, Port Moresby",
  },
};

function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function hubJitter(index) {
  const n = index + 1;
  return {
    dLat: ((n % 5) - 2) * 0.00005,
    dLng: ((Math.floor(n / 5) % 5) - 2) * 0.00005,
  };
}

function row(city, rec, hubIndex) {
  const [id, name, website, sector, address, lat, lng, blurb, buildingId] = rec;
  const domain = domainFromWebsite(website);
  const building = buildingId ? BUILDINGS[buildingId] : null;
  const jitter = building ? hubJitter(hubIndex.value++) : { dLat: 0, dLng: 0 };
  return {
    id,
    name,
    city,
    lat: building ? building.lat + jitter.dLat : lat,
    lng: building ? building.lng + jitter.dLng : lng,
    website,
    sector,
    address: building ? building.address : address,
    blurb,
    ...(building
      ? { buildingId, buildingName: building.name }
      : {}),
    ...(domain
      ? {
          logoUrl: `https://logo.clearbit.com/${domain}`,
          imageUrls: [
            `https://s0.wp.com/mshots/v1/${encodeURIComponent(website)}?w=1200`,
          ],
        }
      : {}),
  };
}

function writeCity(city, records) {
  const hubIndex = { value: 0 };
  const startups = records.map((rec) => row(city, rec, hubIndex));
  const file = path.join(startupsDir, `${city}.json`);
  fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
  console.log(`${city}: ${startups.length}`);
}

const auckland = [
  ["akl-xero", "Xero", "https://www.xero.com", "SaaS", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Cloud accounting platform founded in New Zealand, with a major Auckland product office.", "auckland-gridakl"],
  ["akl-vend", "Lightspeed (Vend)", "https://www.lightspeedhq.com", "SaaS", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Retail POS and commerce software; Vend was founded in Auckland.", "auckland-gridakl"],
  ["akl-soul-machines", "Soul Machines", "https://www.soulmachines.com", "AI", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Digital people and conversational AI company founded in Auckland.", "auckland-gridakl"],
  ["akl-auror", "Auror", "https://www.auror.co", "SaaS", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Retail crime intelligence platform used by supermarket and retail networks.", "auckland-gridakl"],
  ["akl-fergus", "Fergus", "https://fergus.com", "SaaS", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Job management software for trade businesses, founded in Auckland.", "auckland-icehouse"],
  ["akl-unleashed", "Unleashed Software", "https://www.unleashedsoftware.com", "SaaS", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Inventory and manufacturing software for product businesses.", "auckland-icehouse"],
  ["akl-first-aml", "First AML", "https://www.firstaml.com", "FinTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "AML onboarding and compliance platform for professional services firms.", "auckland-gridakl"],
  ["akl-centrapay", "Centrapay", "https://www.centrapay.com", "FinTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Account-to-account payments network built in New Zealand.", "auckland-gridakl"],
  ["akl-kami", "Kami", "https://www.kamiapp.com", "EdTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Classroom document and PDF app used by schools worldwide.", "auckland-gridakl"],
  ["akl-90seconds", "90 Seconds", "https://90seconds.com", "Media", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Video production platform connecting brands with global crews.", "auckland-gridakl"],
  ["akl-mega", "MEGA", "https://mega.io", "Cloud", "2 Queen St, Auckland CBD", -36.8456, 174.7655, "Privacy-focused cloud storage and collaboration platform founded in Auckland."],
  ["akl-rocket-lab", "Rocket Lab", "https://www.rocketlabusa.com", "Aerospace", "25 Airpark Dr, Auckland Airport", -36.9992, 174.7904, "Small-launch aerospace company with major manufacturing in Auckland."],
  ["akl-eroad", "EROAD", "https://www.eroad.co.nz", "Transport", "260 Oteha Valley Rd, Albany, Auckland", -36.7281, 174.7082, "Transport technology and A-road user charging platform headquartered in Auckland."],
  ["akl-serato", "Serato", "https://serato.com", "Media", "52 Sale St, Freemans Bay, Auckland", -36.8532, 174.7538, "DJ and music software company founded in Auckland."],
  ["akl-ninja-kiwi", "Ninja Kiwi", "https://ninjakiwi.com", "Games", "Level 4/12 Madden St, Auckland", -36.84145, 174.75625, "Game studio behind Bloons and other long-running titles.", "auckland-gridakl"],
  ["akl-grinding-gear", "Grinding Gear Games", "https://www.grindinggear.com", "Games", "6/23 Edwin St, Mt Eden, Auckland", -36.8765, 174.7598, "Studio behind Path of Exile, based in Auckland."],
  ["akl-halter", "Halter", "https://www.halterhq.com", "AgriTech", "102/165 The Strand, Parnell, Auckland", -36.8506, 174.7812, "Solar-powered cattle collars and virtual fencing for pastoral farms."],
  ["akl-figured", "Figured", "https://www.figured.com", "AgriTech", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Farm financial management software used across NZ and Australia.", "auckland-icehouse"],
  ["akl-hnry", "Hnry", "https://hnry.com", "FinTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Tax, invoicing, and admin platform for contractors and sole traders.", "auckland-gridakl"],
  ["akl-kernel", "Kernel Wealth", "https://www.kernelwealth.co.nz", "FinTech", "22 Fanshawe St, Auckland CBD", -36.8448, 174.7579, "Low-fee KiwiSaver and investment funds built in Auckland."],
  ["akl-harmoney", "Harmoney", "https://www.harmoney.co.nz", "FinTech", "110 Customs St W, Auckland CBD", -36.8442, 174.7638, "Digital consumer lending marketplace founded in Auckland."],
  ["akl-pushpay", "Pushpay", "https://pushpay.com", "FinTech", "167 Victoria St W, Auckland CBD", -36.8489, 174.7552, "Payments and engagement software with New Zealand roots and an Auckland office."],
  ["akl-imagr", "Imagr", "https://imagr.co", "RetailTech", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Computer-vision checkout and retail automation company.", "auckland-icehouse"],
  ["akl-coretex", "Coretex", "https://www.coretex.com", "Transport", "7a Taylors Rd, Morningside, Auckland", -36.8728, 174.7364, "Fleet telematics and cold-chain monitoring platform."],
  ["akl-devoli", "Devoli", "https://www.devoli.com", "Telecom", "58 Gaunt St, Wynyard Quarter, Auckland", -36.8428, 174.7572, "Wholesale connectivity and software-defined network services."],
  ["akl-montoux", "Montoux", "https://www.montoux.com", "InsurTech", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Actuarial automation software for life insurers.", "auckland-icehouse"],
  ["akl-tracksuit", "Tracksuit", "https://www.tracksuit.com", "MarTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Brand-tracking platform for in-house marketing teams.", "auckland-gridakl"],
  ["akl-crimson", "Crimson Education", "https://www.crimsoneducation.com", "EdTech", "18 Viaduct Harbour Ave, Auckland", -36.8438, 174.7612, "University admissions mentoring company founded in Auckland."],
  ["akl-eventfinda", "Eventfinda", "https://www.eventfinda.co.nz", "Marketplace", "101 Pakenham St, Auckland CBD", -36.8426, 174.7598, "Events discovery and ticketing marketplace across New Zealand."],
  ["akl-bookme", "Bookme", "https://www.bookme.co.nz", "Marketplace", "2/22 Dundonald St, Eden Terrace, Auckland", -36.8645, 174.7588, "Experiences and activities booking platform."],
  ["akl-atomic-tessellator", "Atomic Tessellator", "https://www.atomictessellator.com", "DeepTech", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "AI materials-science company designing alternatives to rare-earth elements.", "auckland-icehouse"],
  ["akl-ai-foundry", "AI Foundry", "https://www.aifoundry.co.nz", "AI", "Datacom, Auckland", -36.8472, 174.7658, "Sovereign AI infrastructure hosted in Auckland data centres."],
  ["akl-icehouse-ventures", "Icehouse Ventures", "https://www.icehouseventures.co.nz", "Venture", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Early-stage New Zealand venture firm and founder community.", "auckland-icehouse"],
  ["akl-gridakl", "GridAKL", "https://www.gridakl.com", "Hub", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Auckland’s waterfront innovation precinct for high-growth tech companies.", "auckland-gridakl"],
  ["akl-generator", "Generator", "https://generatornz.com", "Hub", "Level 1/100 Carlton Gore Rd, Newmarket, Auckland", -36.8694, 174.7768, "Coworking and founder community with a flagship Newmarket campus."],
  ["akl-bizdojo-akl", "BizDojo Auckland", "https://www.bizdojo.com", "Hub", "5 Britomart Pl, Auckland CBD", -36.8443, 174.7678, "Flexible workspace and startup community in Britomart."],
  ["akl-sharesies-akl", "Sharesies", "https://www.sharesies.nz", "FinTech", "22 Fanshawe St, Auckland CBD", -36.8448, 174.7579, "Investment platform with a growing Auckland team alongside its Wellington HQ."],
  ["akl-timely", "Timely", "https://www.gettimely.com", "SaaS", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Salon and wellness booking software with New Zealand origins.", "auckland-icehouse"],
  ["akl-asknicely-akl", "AskNicely", "https://www.asknicely.com", "SaaS", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Customer experience and NPS software with a New Zealand engineering base.", "auckland-gridakl"],
  ["akl-liven", "Liven", "https://www.liven.com.au", "FinTech", "12 Madden St, Auckland CBD", -36.84145, 174.75625, "Dining rewards and merchant payments network with an Auckland presence.", "auckland-gridakl"],
  ["akl-wipster", "Wipster", "https://wipster.io", "Media", "The Strand, Parnell, Auckland", -36.8509, 174.7804, "Video review and approval software for creative teams.", "auckland-icehouse"],
  ["akl-mint-innovation", "Mint Innovation", "https://www.mint-innovation.com", "Climate", "9 Saunders Pl, Avondale, Auckland", -36.8924, 174.6955, "Recovers precious metals from e-waste using biology-based processes."],
];

const wellington = [
  ["wlg-xero", "Xero", "https://www.xero.com", "SaaS", "19 Walter St, Te Aro, Wellington", -41.2961, 174.7745, "Xero’s founding home; major product and engineering campus in Wellington."],
  ["wlg-sharesies", "Sharesies", "https://www.sharesies.nz", "FinTech", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Investment platform that started in Wellington and opened investing to first-timers.", "wellington-creative-hq"],
  ["wlg-trademe", "Trade Me", "https://www.trademe.co.nz", "Marketplace", "2 Queen St, Wellington CBD", -41.2848, 174.7769, "New Zealand’s largest online marketplace, headquartered on Wellington’s waterfront."],
  ["wlg-vista", "Vista Group", "https://vistagroup.co.nz", "SaaS", "50 Manners St, Wellington", -41.2912, 174.7784, "Cinema software group spanning ticketing, advertising, and moviegoer data."],
  ["wlg-sterling", "Sterling", "https://www.sterling.ai", "FinTech", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "AI accounting automation startup founded in Wellington.", "wellington-creative-hq"],
  ["wlg-litmaps", "Litmaps", "https://www.litmaps.com", "Research", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Literature-discovery software for researchers, built in Wellington.", "wellington-creative-hq"],
  ["wlg-asknicely", "AskNicely", "https://www.asknicely.com", "SaaS", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Customer experience platform with Wellington roots.", "wellington-creative-hq"],
  ["wlg-creative-hq", "Creative HQ", "https://creativehq.co.nz", "Hub", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Wellington incubator and accelerator behind many of NZ’s best-known startups.", "wellington-creative-hq"],
  ["wlg-hnry", "Hnry", "https://hnry.com", "FinTech", "Level 4/111 Customhouse Quay, Wellington", -41.2839, 174.7791, "Contractor tax and admin platform with a strong Wellington team."],
  ["wlg-hatch", "Hatch", "https://www.hatchinvest.nz", "FinTech", "111 Customhouse Quay, Wellington", -41.2839, 174.7791, "Investing app for NZX, ASX, and US shares, based in Wellington."],
  ["wlg-melon-health", "Melon Health", "https://www.melonhealth.com", "Health", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Digital therapeutics and chronic-condition coaching platform.", "wellington-creative-hq"],
  ["wlg-pikpok", "PikPok", "https://www.pikpok.com", "Games", "115 Tory St, Te Aro, Wellington", -41.2974, 174.7806, "Mobile game studio behind Into the Dead and other titles."],
  ["wlg-weta-digital", "Wētā FX", "https://www.wetafx.co.nz", "Media", "9–15 Manuka St, Miramar, Wellington", -41.3108, 174.8216, "Visual effects studio anchoring Wellington’s Miramar screen cluster."],
  ["wlg-weta-workshop", "Wētā Workshop", "https://www.wetaworkshop.com", "Media", "1 Weka St, Miramar, Wellington", -41.3122, 174.8148, "Design and physical effects studio in Miramar."],
  ["wlg-park-road", "Park Road Post", "https://www.parkroad.co.nz", "Media", "4 Park Rd, Miramar, Wellington", -41.3096, 174.8195, "Post-production and sound facility serving global screen productions."],
  ["wlg-datacom-wlg", "Datacom", "https://datacom.com", "Enterprise", "55 Featherston St, Wellington", -41.2798, 174.7786, "NZ-owned technology services firm with a large Wellington campus."],
  ["wlg-delivereasy", "Delivereasy", "https://www.delivereasy.co.nz", "Logistics", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Local restaurant delivery network founded in Wellington.", "wellington-creative-hq"],
  ["wlg-marloo", "Marloo", "https://www.marloo.ai", "FinTech", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "AI assistant for financial advisers, built in Wellington.", "wellington-creative-hq"],
  ["wlg-spotlight", "Spotlight Reporting", "https://www.spotlightreporting.com", "SaaS", "50 Customhouse Quay, Wellington", -41.2836, 174.7778, "Reporting and advisory software for accountants."],
  ["wlg-bizdojo-wlg", "BizDojo Wellington", "https://www.bizdojo.com", "Hub", "2 Taranaki St, Te Aro, Wellington", -41.2918, 174.7789, "Waterfront coworking hub used by product and services startups."],
  ["wlg-homely", "Homely", "https://homely.co.nz", "FinTech", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Home-loan platform coming out of Creative HQ’s fintech programmes.", "wellington-creative-hq"],
  ["wlg-tradewindow", "TradeWindow", "https://www.tradewindow.io", "TradeTech", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Digital trade documents and supply-chain platform.", "wellington-creative-hq"],
  ["por-whitireia-innovation", "Whitireia & WelTec Innovation", "https://www.whitireiaweltec.ac.nz", "EdTech", "3 Wi Neera Dr, Porirua", -41.1378, 174.8392, "Porirua campus supporting applied tech, design, and founder programmes."],
  ["por-ngati-toa", "Te Āhuru Mōwai digital", "https://www.ngatitoa.iwi.nz", "CivicTech", "26 Ngatitoa St, Takapūwāhia, Porirua", -41.1039, 174.8416, "iwi-led digital and enterprise activity on the Porirua harbour."],
  ["por-porirua-business", "Porirua Business Hub", "https://poriruachamber.org.nz", "Hub", "17 Parumoana St, Porirua", -41.1348, 174.8399, "City business hub on the Porirua CBD waterfront for local operators and startups."],
  ["por-caniwi", "Caniwi Capital", "https://www.caniwicapital.com", "Venture", "1 Walton Leigh Ave, Porirua", -41.1356, 174.8408, "Investment office with a Porirua presence supporting growth companies."],
  ["hutt-callaghan", "Callaghan Innovation", "https://www.callaghaninnovation.govt.nz", "DeepTech", "69 Gracefield Rd, Lower Hutt", -41.2338, 174.9166, "National innovation agency labs at Gracefield, Lower Hutt."],
  ["hutt-robinson", "Robinson Research Institute", "https://www.wgtn.ac.nz/robinson", "DeepTech", "69 Gracefield Rd, Lower Hutt", -41.2342, 174.9172, "Superconductivity and cryogenics research commercialisation in Gracefield."],
  ["hutt-gns", "GNS Science", "https://www.gns.cri.nz", "DeepTech", "1 Fairway Dr, Avalon, Lower Hutt", -41.1986, 174.9418, "Geoscience and isotope science campus in Avalon, Lower Hutt."],
  ["hutt-petone-workshop", "Jackson Street Workshop", "https://www.hutt.city", "Hub", "200 Jackson St, Petone, Lower Hutt", -41.2264, 174.8708, "Petone high-street cluster of product, design, and small software firms."],
  ["hutt-dynamic-controls", "Dynamic Controls", "https://dynamiccontrols.com", "Health", "17 Print Pl, Seaview, Lower Hutt", -41.2445, 174.9078, "Powered-wheelchair and mobility electronics designed in Lower Hutt."],
  ["uh-upper-hutt-hub", "Upper Hutt Business Hub", "https://upperhutt.nz", "Hub", "836 Fergusson Dr, Upper Hutt", -41.1245, 175.0706, "Upper Hutt city-centre workspace for local software and professional firms."],
  ["uh-expressions-digital", "Whirinaki digital studio", "https://www.expressions.org.nz", "Media", "836 Fergusson Dr, Upper Hutt", -41.1242, 175.0712, "Civic creative venue supporting digital production in Upper Hutt."],
  ["uh-silverstream", "Silverstream Tech", "https://www.upperhuttcity.com", "SaaS", "3 Whakatiki St, Silverstream, Upper Hutt", -41.1468, 175.0104, "Suburban software and services cluster between Lower and Upper Hutt."],
  ["wlg-niwa", "NIWA", "https://www.niwa.co.nz", "DeepTech", "301 Evans Bay Parade, Greta Point, Wellington", -41.3055, 174.8068, "Ocean and climate science with commercial forecasting tools, Greta Point."],
  ["wlg-loyalty", "Loyalty NZ", "https://www.loyalty.co.nz", "SaaS", "109 Featherston St, Wellington", -41.2806, 174.7774, "Flybuys operator and loyalty-tech platform based in Wellington."],
  ["wlg-bnz", "BNZ Partners digital", "https://www.bnz.co.nz", "FinTech", "80 Willis St, Wellington", -41.2876, 174.7748, "Bank digital product teams serving Wellington’s public and private sector."],
  ["wlg-ackama", "Ackama", "https://www.ackama.com", "SaaS", "7 Dixon St, Te Aro, Wellington", -41.2926, 174.7772, "Product consultancy and venture studio building public-sector and startup software.", "wellington-creative-hq"],
  ["wlg-boost", "Boost", "https://www.boost.co.nz", "SaaS", "Level 6/111 The Terrace, Wellington", -41.2849, 174.7752, "Agile product team building government and commercial digital services."],
  ["wlg-catalyst", "Catalyst", "https://www.catalyst.net.nz", "OpenSource", "150 Willis St, Wellington", -41.2904, 174.7746, "Open-source software company with a long Wellington presence."],
  ["wlg-fuseworks", "Fuseworks", "https://www.fuseworks.co.nz", "Media", "15 College St, Te Aro, Wellington", -41.2988, 174.7736, "Publishing technology and content platform operator."],
  ["wlg-powershop", "Meridian / Powershop", "https://www.powershop.co.nz", "Energy", "33 Customhouse Quay, Wellington", -41.2832, 174.7784, "Digital electricity retailer that pioneered app-based power shopping."],
];

const christchurch = [
  ["chc-seequent", "Seequent", "https://www.seequent.com", "Geoscience", "20 Hawthorne Dr, Addington, Christchurch", -43.5436, 172.6098, "Subsurface geoscience software (Leapfrog) headquartered in Christchurch."],
  ["chc-dawn", "Dawn Aerospace", "https://www.dawnaerospace.com", "Aerospace", "Christchurch Airport, Harewood", -43.4865, 172.5328, "Spaceplane and green satellite-propulsion company based at Christchurch Airport."],
  ["chc-partly", "Partly", "https://www.partly.com", "SaaS", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Auto-parts catalogue and commerce infrastructure founded in Christchurch.", "christchurch-epic"],
  ["chc-orbica", "Orbica", "https://www.orbica.com", "Geospatial", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Geospatial AI and data platform built in Christchurch.", "christchurch-epic"],
  ["chc-tait", "Tait Communications", "https://www.taitradio.com", "Telecom", "245 Wooldridge Rd, Harewood, Christchurch", -43.4788, 172.5586, "Mission-critical radio communications designed in Christchurch."],
  ["chc-jade", "Jade Software", "https://www.jadeworld.com", "Enterprise", "5 Sir Gil Simpson Dr, Burnside, Christchurch", -43.5068, 172.5684, "Enterprise software and payments technology company founded in Christchurch."],
  ["chc-invert", "Invert Robotics", "https://www.invertrobotics.com", "Robotics", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Inspection robots for tanks and industrial assets.", "christchurch-epic"],
  ["chc-epic", "EPIC Innovation", "https://www.epicinnovation.co.nz", "Hub", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Christchurch’s inner-city innovation campus for tech tenants.", "christchurch-epic"],
  ["chc-ministry-awesome", "Ministry of Awesome", "https://www.ministryofawesome.com", "Hub", "96 Lichfield St, Christchurch Central", -43.5339, 172.6384, "Founder community and startup programmes for Ōtautahi."],
  ["chc-te-ohaka", "Te Ohaka", "https://www.ara.ac.nz", "Hub", "130 Madras St, Christchurch Central", -43.5386, 172.6436, "Ara Institute food and product innovation space in the central city."],
  ["chc-dynamic", "Dynamic Controls", "https://dynamiccontrols.com", "Health", "17 Print Pl (Christchurch office), Addington", -43.5448, 172.6142, "Mobility electronics with design and commercial teams in Christchurch."],
  ["chc-scott", "Scott Technology", "https://scottautomation.com", "Robotics", "10 Maces Rd, Bromley, Christchurch", -43.5372, 172.7024, "Industrial automation and protein-processing robotics."],
  ["chc-aranz", "ARANZ Medical", "https://www.aranzmedical.com", "Health", "47 Hereford St, Christchurch Central", -43.5308, 172.6336, "3D wound-imaging medical devices from Christchurch."],
  ["chc-where-scape", "WhereScape", "https://www.wherescape.com", "Data", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Data-warehouse automation software with Christchurch engineering roots.", "christchurch-epic"],
  ["chc-sli", "SLI Systems", "https://www.sli-systems.com", "SaaS", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Site search and personalisation technology founded in Christchurch.", "christchurch-epic"],
  ["chc-unlimited", "Unlimited Realities", "https://www.unlimitedrealities.com", "XR", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Spatial computing and simulation studio.", "christchurch-epic"],
  ["chc-cropx", "CropX", "https://www.cropx.com", "AgriTech", "Lincoln township / Christchurch office", -43.6401, 172.4864, "Soil-sensing agritech with a Canterbury commercial presence."],
  ["chc-lincoln-agritech", "Lincoln Agritech", "https://www.lincolnagritech.co.nz", "AgriTech", "Engineering Dr, Lincoln, Canterbury", -43.6436, 172.4682, "Applied research company commercialising agri and environmental tech."],
  ["chc-canterprise", "Canterprise", "https://www.canterbury.ac.nz", "Hub", "20 Kirkwood Ave, Ilam, Christchurch", -43.5226, 172.5808, "University of Canterbury commercialisation office."],
  ["chc-healthone", "HealthOne", "https://www.healthone.org.nz", "Health", "248 Papanui Rd, Merivale, Christchurch", -43.5112, 172.6284, "Shared electronic health record used across the South Island."],
  ["chc-pulse", "Pulse Energy", "https://www.pulseenergy.co.nz", "Energy", "181 High St, Christchurch Central", -43.5338, 172.6412, "Electricity retailer with digital self-service built in Christchurch."],
  ["chc-arc", "Arc by Capgemini", "https://www.capgemini.com", "Enterprise", "123 Victoria St, Christchurch Central", -43.5294, 172.6278, "Digital engineering campus in the rebuilt central city."],
  ["chc-allied-telesis", "Allied Telesis Labs", "https://www.alliedtelesis.com", "Telecom", "27 Nazareth Ave, Middleton, Christchurch", -43.5418, 172.5986, "Network hardware and software engineering lab."],
  ["chc-humanware", "HumanWare", "https://www.humanware.com", "Health", "11 Radley St, Woolston, Christchurch", -43.5486, 172.6794, "Assistive technology for vision impairment."],
  ["chc-nextwindow", "NextWindow", "https://www.nextwindow.com", "Hardware", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Optical multi-touch hardware company with Christchurch origins.", "christchurch-epic"],
  ["chc-recover", "Recover", "https://www.recover.co.nz", "Climate", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Post-disaster and insurance workflow software.", "christchurch-epic"],
  ["chc-taggtech", "Taggtech", "https://www.taggtech.co.nz", "IoT", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "Asset-tracking and IoT solutions from Canterbury.", "christchurch-epic"],
  ["chc-4sight", "4Sight Consulting", "https://www.4sight.co.nz", "Climate", "2 Waterside Close, Ferrymead, Christchurch", -43.5572, 172.7018, "Environmental data and advisory technology."],
  ["chc-magic-memories", "Magic Memories", "https://www.magicmemories.com", "Media", "107 Montreal St, Sydenham, Christchurch", -43.5476, 172.6342, "Attraction photography and media technology."],
  ["chc-xemt", "XEMT", "https://www.xemt.ai", "AI", "78 Manchester St, Christchurch Central", -43.5334, 172.6398, "AI software and consultancy based in Christchurch.", "christchurch-epic"],
];

const singapore = [
  ["sg-grab", "Grab", "https://www.grab.com", "Superapp", "3 Media Close, Singapore 138498", 1.2926, 103.7904, "Southeast Asia superapp for mobility, deliveries, and financial services, headquartered at one-north."],
  ["sg-sea", "Sea Limited", "https://www.sea.com", "Internet", "1 Fusionopolis Place, Singapore 138522", 1.2992, 103.7894, "Parent of Shopee, Garena, and SeaMoney, based in Singapore."],
  ["sg-shopee", "Shopee", "https://shopee.sg", "Marketplace", "1 Fusionopolis Place, Singapore 138522", 1.2993, 103.7896, "Regional e-commerce platform with product and ops teams in Singapore."],
  ["sg-carousell", "Carousell", "https://www.carousell.sg", "Marketplace", "1 Fusionopolis Way, Singapore 138632", 1.2995, 103.7871, "Classifieds marketplace with HQ at LaunchPad @ one-north.", "singapore-launchpad"],
  ["sg-nium", "Nium", "https://www.nium.com", "FinTech", "168 Robinson Rd, Capital Tower, Singapore 068912", 1.2776, 103.8476, "Real-time cross-border payments, co-headquartered at Capital Tower."],
  ["sg-razer", "Razer", "https://www.razer.com", "Hardware", "1 one-north Crescent, Singapore 138522", 1.2998, 103.7878, "Gaming hardware and software group with its global HQ in Singapore."],
  ["sg-ninjavan", "Ninja Van", "https://www.ninjavan.co", "Logistics", "30A Kallang Pl, Singapore 339213", 1.3188, 103.8668, "Last-mile logistics network founded in Singapore."],
  ["sg-patsnap", "PatSnap", "https://www.patsnap.com", "SaaS", "1 Fusionopolis Way, Singapore 138632", 1.2995, 103.7871, "Innovation intelligence and patent analytics platform.", "singapore-launchpad"],
  ["sg-propertyguru", "PropertyGuru", "https://www.propertyguru.com.sg", "PropTech", "Paya Lebar Quarter, 1 Paya Lebar Link, Singapore", 1.3178, 103.8924, "Property portal and fintech group listed out of Singapore."],
  ["sg-shopback", "ShopBack", "https://www.shopback.sg", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Cashback and card rewards platform founded in Singapore.", "singapore-block71"],
  ["sg-carro", "Carro", "https://carro.co", "Marketplace", "18 Tannery Ln, Singapore 347780", 1.3266, 103.8802, "Used-car marketplace and auto fintech across Southeast Asia."],
  ["sg-trax", "Trax", "https://traxretail.com", "RetailTech", "5 Shenton Way, Singapore 068808", 1.2772, 103.8494, "Computer-vision retail execution platform."],
  ["sg-advance-ai", "Advance.AI", "https://www.advance.ai", "AI", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Identity, credit, and anti-fraud AI for emerging markets.", "singapore-block71"],
  ["sg-endowus", "Endowus", "https://endowus.com", "FinTech", "1 Raffles Quay, Singapore 048583", 1.2812, 103.8518, "Digital wealth platform for CPF, SRS, and cash investments."],
  ["sg-stashaway", "StashAway", "https://www.stashaway.sg", "FinTech", "1 Raffles Place, Singapore 048616", 1.2842, 103.8511, "Robo-advisory and cash management platform."],
  ["sg-syfe", "Syfe", "https://www.syfe.com", "FinTech", "8 Marina View, Singapore 018960", 1.2806, 103.8536, "Investment and cash management app."],
  ["sg-funding-societies", "Funding Societies", "https://fundingsocieties.com", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "SME digital lending marketplace across ASEAN.", "singapore-block71"],
  ["sg-aspire", "Aspire", "https://aspireapp.com", "FinTech", "1 Raffles Quay, Singapore 048583", 1.2813, 103.8519, "All-in-one finance OS for growing businesses."],
  ["sg-fazz", "Fazz", "https://fazz.com", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Payments and business banking infrastructure for Southeast Asia.", "singapore-block71"],
  ["sg-igloo", "Igloo", "https://www.iglooinsure.com", "InsurTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Embedded insurance platform for digital ecosystems.", "singapore-block71"],
  ["sg-zenyum", "Zenyum", "https://www.zenyum.com", "Health", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Direct-to-consumer dental and oral-care brand.", "singapore-block71"],
  ["sg-doctor-anywhere", "Doctor Anywhere", "https://doctoranywhere.com", "Health", "1 Fusionopolis Way, Singapore 138632", 1.2995, 103.7871, "Telehealth and outpatient care network.", "singapore-launchpad"],
  ["sg-homage", "Homage", "https://www.homage.sg", "Health", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Home-care marketplace for nurses and caregivers.", "singapore-block71"],
  ["sg-99co", "99.co", "https://www.99.co", "PropTech", "73 Ayer Rajah Crescent, Singapore 139952", 1.2982, 103.7874, "Property search portal founded in Singapore."],
  ["sg-circles", "Circles.Life", "https://www.circles.life", "Telecom", "221 Henderson Rd, Singapore 159557", 1.2878, 103.8216, "Digital telco and lifestyle subscription brand."],
  ["sg-secretlab", "Secretlab", "https://secretlab.co", "Hardware", "8 Burn Rd, Singapore 369977", 1.3358, 103.8856, "Gaming-chair and furniture brand founded in Singapore."],
  ["sg-lazada", "Lazada", "https://www.lazada.sg", "Marketplace", "51 Bras Basah Rd, Lazada One, Singapore 189554", 1.2964, 103.8506, "Regional e-commerce platform with a large Singapore HQ."],
  ["sg-tiktok", "TikTok", "https://www.tiktok.com", "Media", "1 Raffles Quay, South Tower, Singapore", 1.2811, 103.8517, "Product and trust-and-safety campus for TikTok in Singapore."],
  ["sg-bytedance", "ByteDance", "https://www.bytedance.com", "Media", "1 Raffles Quay, Singapore 048583", 1.281, 103.8516, "ByteDance’s Singapore regional headquarters."],
  ["sg-antler", "Antler", "https://www.antler.co", "Venture", "128 Prinsep St, Singapore 187655", 1.3012, 103.8514, "Global early-stage venture firm founded in Singapore."],
  ["sg-block71", "BLOCK71", "https://block71.co", "Hub", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "NUS Enterprise startup cluster at one-north.", "singapore-block71"],
  ["sg-launchpad", "LaunchPad @ one-north", "https://www.jtc.gov.sg", "Hub", "1 Fusionopolis Way, Singapore 138632", 1.2995, 103.7871, "JTC startup cluster that houses many scale-ups.", "singapore-launchpad"],
  ["sg-singsaver", "SingSaver", "https://www.singsaver.com.sg", "FinTech", "80 Robinson Rd, Singapore 068898", 1.2808, 103.8488, "Personal-finance comparison marketplace."],
  ["sg-moneysmart", "MoneySmart", "https://www.moneysmart.sg", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Insurance and credit comparison platform.", "singapore-block71"],
  ["sg-oddle", "Oddle", "https://oddle.me", "SaaS", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Restaurant e-commerce and ordering software.", "singapore-block71"],
  ["sg-burpple", "Burpple", "https://www.burpple.com", "Media", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Food discovery and dining-deals platform.", "singapore-block71"],
  ["sg-biofourmis", "Biofourmis", "https://biofourmis.com", "Health", "1 Fusionopolis Way, Singapore 138632", 1.2995, 103.7871, "Digital therapeutics and remote-care platform.", "singapore-launchpad"],
  ["sg-mirxes", "MiRXES", "https://www.mirxes.com", "Health", "2 Tukang Innovation Grove, Singapore 618305", 1.3272, 103.6778, "RNA diagnostics company with HQ in Singapore."],
  ["sg-validus", "Validus", "https://validus.sg", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Invoice financing for Southeast Asian SMEs.", "singapore-block71"],
  ["sg-addx", "ADDX", "https://addx.co", "FinTech", "6 Battery Rd, Singapore 049909", 1.2856, 103.8519, "Private-market securities exchange using digital assets."],
  ["sg-xendit-sg", "Xendit", "https://www.xendit.co", "FinTech", "71 Ayer Rajah Crescent, Singapore 139951", 1.2979, 103.7876, "Payments infrastructure with a Singapore regional office.", "singapore-block71"],
  ["sg-traveloka-sg", "Traveloka", "https://www.traveloka.com", "Travel", "1 Raffles Place, Singapore 048616", 1.2843, 103.851, "Travel superapp regional office in Raffles Place."],
];

const jakarta = [
  ["jkt-gojek", "Gojek", "https://www.gojek.com", "Superapp", "Pasaraya Blok M, Jakarta Selatan", -6.2441, 106.7996, "On-demand mobility, food, and payments superapp founded in Jakarta."],
  ["jkt-goto", "GoTo", "https://www.gotocompany.com", "Internet", "SCBD, Jl. Jend. Sudirman, Jakarta Selatan", -6.225, 106.809, "Holding company for Gojek and Tokopedia, based in Jakarta.", "jakarta-scbd"],
  ["jkt-tokopedia", "Tokopedia", "https://www.tokopedia.com", "Marketplace", "Ciputra World 2, Jl. Prof. Dr. Satrio, Jakarta", -6.2244, 106.8268, "Indonesia’s homegrown e-commerce marketplace."],
  ["jkt-traveloka", "Traveloka", "https://www.traveloka.com", "Travel", "Lippo Kuningan, Jl. HR Rasuna Said, Jakarta", -6.2214, 106.8312, "Travel and lifestyle superapp headquartered in Jakarta."],
  ["jkt-bukalapak", "Bukalapak", "https://www.bukalapak.com", "Marketplace", "MSIG Tower, Jl. Sudirman, Jakarta", -6.2088, 106.821, "Public e-commerce and mitra platform."],
  ["jkt-blibli", "Blibli", "https://www.blibli.com", "Marketplace", "GKD, Jl. Gatot Subroto, Jakarta", -6.2356, 106.8324, "Omnichannel marketplace from Djarum’s tech group."],
  ["jkt-ovo", "OVO", "https://www.ovo.id", "FinTech", "Lippo Thamrin, Jakarta Pusat", -6.1886, 106.8228, "Digital payments and loyalty wallet."],
  ["jkt-dana", "DANA", "https://www.dana.id", "FinTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Digital wallet used across Indonesian merchants.", "jakarta-scbd"],
  ["jkt-gopay", "GoPay", "https://www.gopay.co.id", "FinTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Payments arm of the GoTo group.", "jakarta-scbd"],
  ["jkt-xendit", "Xendit", "https://www.xendit.co", "FinTech", "Treasury Tower, SCBD, Jakarta", -6.2254, 106.8094, "Payments API and invoice platform founded in Jakarta.", "jakarta-scbd"],
  ["jkt-midtrans", "Midtrans", "https://midtrans.com", "FinTech", "GoTo campus, Jakarta Selatan", -6.244, 106.7998, "Payment gateway now part of GoTo."],
  ["jkt-ruangguru", "Ruangguru", "https://www.ruangguru.com", "EdTech", "Jl. Tebet Barat Dalam, Jakarta Selatan", -6.2368, 106.8504, "Education technology platform for K-12 and upskilling."],
  ["jkt-halodoc", "Halodoc", "https://www.halodoc.com", "Health", "Treasury Tower, SCBD, Jakarta", -6.225, 106.809, "Telemedicine, pharmacy, and lab marketplace.", "jakarta-scbd"],
  ["jkt-alodokter", "Alodokter", "https://www.alodokter.com", "Health", "Jl. KH Wahid Hasyim, Jakarta Pusat", -6.1868, 106.8216, "Health content and teleconsult platform."],
  ["jkt-ajaib", "Ajaib", "https://www.ajaib.co.id", "FinTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Retail stock and mutual-fund brokerage app.", "jakarta-scbd"],
  ["jkt-bibit", "Bibit", "https://bibit.id", "FinTech", "Treasury Tower, SCBD, Jakarta", -6.2252, 106.8092, "Robo-advisory mutual-fund platform.", "jakarta-scbd"],
  ["jkt-stockbit", "Stockbit", "https://stockbit.com", "FinTech", "Treasury Tower, SCBD, Jakarta", -6.2253, 106.8093, "Stock community and brokerage, parent of Bibit.", "jakarta-scbd"],
  ["jkt-kredivo", "Kredivo", "https://www.kredivo.com", "FinTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Pay-later and digital credit platform.", "jakarta-scbd"],
  ["jkt-akulaku", "Akulaku", "https://www.akulaku.com", "FinTech", "Kuningan, Jakarta Selatan", -6.2294, 106.8296, "Digital banking and consumer credit across ASEAN."],
  ["jkt-mekari", "Mekari", "https://mekari.com", "SaaS", "South Quarter, Cilandak, Jakarta", -6.2896, 106.8038, "Cloud HR, tax, and accounting suite for Indonesian companies."],
  ["jkt-jurnal", "Jurnal by Mekari", "https://www.jurnal.id", "SaaS", "South Quarter, Cilandak, Jakarta", -6.2898, 106.804, "Online accounting software widely used by SMEs."],
  ["jkt-paperid", "Paper.id", "https://www.paper.id", "SaaS", "SCBD, Jakarta Selatan", -6.225, 106.809, "Invoicing and payables software for SMEs.", "jakarta-scbd"],
  ["jkt-privy", "Privy", "https://privy.id", "SaaS", "Treasury Tower, SCBD, Jakarta", -6.225, 106.809, "Digital identity and e-signature platform.", "jakarta-scbd"],
  ["jkt-efishery", "eFishery Jakarta", "https://efishery.com", "AgriTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Jakarta commercial office for the Bandung-founded aquaculture platform.", "jakarta-scbd"],
  ["jkt-sayurbox", "Sayurbox", "https://www.sayurbox.com", "AgriTech", "Jl. TB Simatupang, Jakarta Selatan", -6.3012, 106.8204, "Farm-to-table grocery marketplace."],
  ["jkt-tanihub", "TaniHub", "https://tanihub.com", "AgriTech", "Jl. TB Simatupang, Jakarta Selatan", -6.2988, 106.8236, "Agri-commerce and financing for farmers and buyers."],
  ["jkt-shipper", "Shipper", "https://shipper.id", "Logistics", "SCBD, Jakarta Selatan", -6.225, 106.809, "Logistics aggregator and fulfilment for e-commerce.", "jakarta-scbd"],
  ["jkt-waresix", "Waresix", "https://www.waresix.com", "Logistics", "SCBD, Jakarta Selatan", -6.225, 106.809, "B2B trucking and warehouse marketplace.", "jakarta-scbd"],
  ["jkt-anteraja", "Anteraja", "https://anteraja.id", "Logistics", "Jl. Raya Casablanca, Jakarta Selatan", -6.2248, 106.8456, "Tech-enabled courier network."],
  ["jkt-tiket", "tiket.com", "https://www.tiket.com", "Travel", "Cyber 2 Tower, Kuningan, Jakarta", -6.2218, 106.8322, "Travel booking platform for flights, hotels, and events."],
  ["jkt-pegipegi", "Pegipegi", "https://www.pegipegi.com", "Travel", "Jl. HR Rasuna Said, Jakarta", -6.2212, 106.8328, "Hotels and flights marketplace."],
  ["jkt-kopi-kenangan", "Kopi Kenangan", "https://kopikenangan.com", "Consumer", "SCBD, Jakarta Selatan", -6.225, 106.809, "Grab-and-go coffee chain with a strong tech platform.", "jakarta-scbd"],
  ["jkt-sociolla", "Sociolla", "https://www.sociolla.com", "Marketplace", "Gandaria City, Jakarta Selatan", -6.2448, 106.7836, "Beauty commerce platform."],
  ["jkt-idn", "IDN", "https://www.idn.media", "Media", "Jl. Jend. Gatot Subroto, Jakarta", -6.2394, 106.8322, "Youth media and entertainment tech group."],
  ["jkt-pinhome", "Pinhome", "https://www.pinhome.id", "PropTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "Property transactions and home services app.", "jakarta-scbd"],
  ["jkt-moladin", "Moladin", "https://www.moladin.com", "Marketplace", "SCBD, Jakarta Selatan", -6.225, 106.809, "Used-car marketplace and dealer financing.", "jakarta-scbd"],
  ["jkt-nodeflux", "Nodeflux", "https://www.nodeflux.io", "AI", "Jl. Kemang Raya, Jakarta Selatan", -6.2604, 106.8148, "Computer-vision platform for cities and enterprises."],
  ["jkt-kata", "Kata.ai", "https://kata.ai", "AI", "Jl. Kemang Raya, Jakarta Selatan", -6.2612, 106.8152, "Conversational AI platform."],
  ["jkt-zenius", "Zenius", "https://www.zenius.net", "EdTech", "Jl. Raya Kebayoran Lama, Jakarta", -6.2388, 106.7824, "Online learning platform for Indonesian students."],
  ["jkt-colearn", "CoLearn", "https://www.colearn.id", "EdTech", "SCBD, Jakarta Selatan", -6.225, 106.809, "AI tutoring for STEM homework.", "jakarta-scbd"],
  ["jkt-sirclo", "SIRCLO", "https://www.sirclo.com", "SaaS", "SCBD, Jakarta Selatan", -6.225, 106.809, "E-commerce infrastructure for brands.", "jakarta-scbd"],
  ["jkt-qasir", "Qasir", "https://www.qasir.id", "SaaS", "Tebet, Jakarta Selatan", -6.2268, 106.8472, "POS app for Indonesian warungs and retailers."],
];

const surabaya = [
  ["sby-gojek", "Gojek Surabaya", "https://www.gojek.com", "Superapp", "Jl. HR Muhammad, Surabaya", -7.2756, 112.7194, "East Java operations and driver-partner office for Gojek."],
  ["sby-grab", "Grab Surabaya", "https://www.grab.com", "Superapp", "Jl. Mayjend Sungkono, Surabaya", -7.2918, 112.7186, "Grab regional office serving Surabaya and East Java."],
  ["sby-shopee", "Shopee Surabaya", "https://shopee.co.id", "Marketplace", "Jl. Ahmad Yani, Surabaya", -7.3196, 112.7348, "E-commerce hub and last-mile operations for East Java."],
  ["sby-tokopedia", "Tokopedia Surabaya", "https://www.tokopedia.com", "Marketplace", "Jl. Basuki Rahmat, Surabaya", -7.2672, 112.7446, "Merchant success and logistics office."],
  ["sby-traveloka", "Traveloka Surabaya", "https://www.traveloka.com", "Travel", "Tunjungan Plaza, Surabaya", -7.2624, 112.7392, "Travel superapp East Java office."],
  ["sby-ruangguru", "Ruangguru Surabaya", "https://www.ruangguru.com", "EdTech", "Jl. Raya Darmo, Surabaya", -7.2884, 112.7378, "Education-tech city team for East Java schools."],
  ["sby-mekari", "Mekari Surabaya", "https://mekari.com", "SaaS", "Pakuwon Tower, Surabaya", -7.2888, 112.6756, "Cloud HR and accounting for East Java SMEs."],
  ["sby-midtrans", "Midtrans Surabaya", "https://midtrans.com", "FinTech", "Jl. Panglima Sudirman, Surabaya", -7.2654, 112.7442, "Payments onboarding for East Java merchants."],
  ["sby-jala", "Jala", "https://jala.tech", "AgriTech", "Sidoarjo / Surabaya metro", -7.4496, 112.7182, "Shrimp-farm sensors and software from the Surabaya metro."],
  ["sby-majoo", "majoo Surabaya", "https://majoo.id", "SaaS", "Jl. Dr. Soetomo, Surabaya", -7.2718, 112.7486, "Cloud POS used by F&B outlets across East Java."],
  ["sby-qasir", "Qasir Surabaya", "https://www.qasir.id", "SaaS", "Jl. Raya Gubeng, Surabaya", -7.2742, 112.7536, "Warung POS adoption team."],
  ["sby-sirclo", "SIRCLO Surabaya", "https://www.sirclo.com", "SaaS", "Jl. Mayjend Sungkono, Surabaya", -7.2922, 112.7192, "Brand e-commerce implementations for East Java manufacturers."],
  ["sby-anteraja", "Anteraja Surabaya", "https://anteraja.id", "Logistics", "Jl. Raya Taman, Sidoarjo", -7.3672, 112.6764, "Parcel hub for Greater Surabaya."],
  ["sby-shipper", "Shipper Surabaya", "https://shipper.id", "Logistics", "Jl. Raya Waru, Sidoarjo", -7.3518, 112.7684, "Fulfilment warehouse serving East Java sellers."],
  ["sby-blibli", "Blibli Surabaya", "https://www.blibli.com", "Marketplace", "Galaxy Mall, Surabaya", -7.2758, 112.7806, "Omnichannel retail tech presence in East Surabaya."],
  ["sby-ovo", "OVO Surabaya", "https://www.ovo.id", "FinTech", "Pakuwon Mall, Surabaya", -7.2892, 112.6752, "Merchant acquiring and city operations."],
  ["sby-dana", "DANA Surabaya", "https://www.dana.id", "FinTech", "Tunjungan Plaza, Surabaya", -7.2626, 112.7394, "Digital wallet city team."],
  ["sby-halodoc", "Halodoc Surabaya", "https://www.halodoc.com", "Health", "Jl. Raya Darmo, Surabaya", -7.2878, 112.7368, "Telemedicine partnerships with East Java clinics."],
  ["sby-airlangga-tekno", "Airlangga Tech", "https://www.unair.ac.id", "Hub", "Kampus C Unair, Mulyorejo, Surabaya", -7.2678, 112.7846, "University commercialisation and health-tech spinouts."],
  ["sby-its-technopark", "ITS Technopark", "https://www.its.ac.id", "Hub", "ITS Sukolilo, Surabaya", -7.2818, 112.7954, "Institut Teknologi Sepuluh Nopember innovation park."],
  ["sby-ciputra", "Ciputra Hub", "https://www.ciputra.ac.id", "Hub", "UC Town, Citraland, Surabaya", -7.2854, 112.6388, "Entrepreneurship campus and startup studio in west Surabaya."],
  ["sby-ddc", "DDC Healthcare Tech", "https://www.ddc.co.id", "Health", "Jl. Ahmad Yani, Surabaya", -7.3188, 112.7356, "Diagnostics and health-information systems."],
  ["sby-jawapos-digital", "Jawa Pos Digital", "https://www.jawapos.com", "Media", "Graha Pena, Jl. Ahmad Yani, Surabaya", -7.3164, 112.7362, "Regional media-tech newsroom and digital products."],
  ["sby-indosat", "Indosat Surabaya", "https://indosatooredoo.com", "Telecom", "Jl. Ahmad Yani, Surabaya", -7.3148, 112.7344, "Telco digital services hub for East Java."],
  ["sby-telkomsel", "Telkomsel Surabaya", "https://www.telkomsel.com", "Telecom", "Jl. Pemuda, Surabaya", -7.2658, 112.7488, "Mobile and digital lifestyle products for East Java."],
  ["sby-xl", "XL Axiata Surabaya", "https://www.xl.co.id", "Telecom", "Jl. Basuki Rahmat, Surabaya", -7.2668, 112.7452, "Network and digital services office."],
  ["sby-bank-jatim-digital", "Bank Jatim Digital", "https://www.bankjatim.co.id", "FinTech", "Jl. Basuki Rahmat, Surabaya", -7.2662, 112.7438, "Regional bank digital channels and SME platforms."],
  ["sby-bukalapak", "Bukalapak Surabaya", "https://www.bukalapak.com", "Marketplace", "Jl. HR Muhammad, Surabaya", -7.2762, 112.7188, "Mitra and marketplace city operations."],
  ["sby-efishery", "eFishery East Java", "https://efishery.com", "AgriTech", "Sidoarjo aquaculture belt", -7.4522, 112.7188, "Pond IoT and financing coverage across East Java farms."],
  ["sby-kargo", "Kargo Technologies", "https://kargo.tech", "Logistics", "Jl. Mayjend Sungkono, Surabaya", -7.2914, 112.7178, "Digital freight for industrial East Java."],
];

const bandung = [
  ["bdg-efishery", "eFishery", "https://efishery.com", "AgriTech", "Jl. Gegerkalong Hilir, Bandung", -6.8624, 107.59, "IoT feeders and financing for fish and shrimp farmers, founded in Bandung."],
  ["bdg-dicoding", "Dicoding", "https://www.dicoding.com", "EdTech", "Jl. Batik Kumeli, Bandung", -6.8986, 107.6188, "Developer education platform founded in Bandung."],
  ["bdg-agate", "Agate", "https://agate.id", "Games", "Jl. Dago, Bandung", -6.8854, 107.6136, "One of Indonesia’s largest game studios, based in Bandung."],
  ["bdg-suitmedia", "Suitmedia", "https://suitmedia.com", "SaaS", "Jl. Sukajadi, Bandung", -6.8822, 107.5968, "Digital product studio with deep Bandung engineering roots."],
  ["bdg-gits", "GITS Indonesia", "https://gits.id", "SaaS", "Jl. Dago Giri, Bandung", -6.8608, 107.6274, "Custom software and cloud engineering company."],
  ["bdg-bdv", "Bandung Digital Valley", "https://www.bandungdigitalvalley.com", "Hub", "Jl. Gegerkalong Hilir, Bandung", -6.9175, 107.6191, "Telkom’s Bandung incubator and startup campus.", "bandung-digital-valley"],
  ["bdg-itb-lpi", "ITB Innovation", "https://www.itb.ac.id", "Hub", "ITB Ganesha, Bandung", -6.8915, 107.6107, "Institut Teknologi Bandung research commercialisation."],
  ["bdg-telkom-university", "Telkom University Hub", "https://telkomuniversity.ac.id", "Hub", "Jl. Telekomunikasi, Dayeuhkolot, Bandung", -6.9734, 107.6304, "Campus startup programmes next to Telkom’s Bandung footprint."],
  ["bdg-brodo", "Brodo", "https://bro.do", "Consumer", "Jl. Trunojoyo, Bandung", -6.8936, 107.6132, "DTC footwear brand with a strong digital commerce stack, founded in Bandung."],
  ["bdg-hangry", "Hangry Bandung", "https://hangry.id", "Consumer", "Jl. Riau, Bandung", -6.9054, 107.6158, "Cloud-kitchen brand with a major Bandung kitchen network."],
  ["bdg-gojek", "Gojek Bandung", "https://www.gojek.com", "Superapp", "Jl. Asia Afrika, Bandung", -6.9214, 107.6098, "City operations for ride-hailing and GoFood."],
  ["bdg-grab", "Grab Bandung", "https://www.grab.com", "Superapp", "Jl. Pasir Kaliki, Bandung", -6.9078, 107.5996, "Grab regional office for West Java."],
  ["bdg-tokopedia", "Tokopedia Bandung", "https://www.tokopedia.com", "Marketplace", "Jl. Cihampelas, Bandung", -6.8932, 107.6038, "Seller community and campus talent office."],
  ["bdg-shopee", "Shopee Bandung", "https://shopee.co.id", "Marketplace", "Jl. Soekarno-Hatta, Bandung", -6.9406, 107.6428, "E-commerce operations for Priangan."],
  ["bdg-ruangguru", "Ruangguru Bandung", "https://www.ruangguru.com", "EdTech", "Jl. Dipatiukur, Bandung", -6.8874, 107.6152, "Edtech city team next to the university belt."],
  ["bdg-zenius", "Zenius Bandung", "https://www.zenius.net", "EdTech", "Jl. Dago, Bandung", -6.8848, 107.6134, "Learning-content production in Bandung."],
  ["bdg-mekari", "Mekari Bandung", "https://mekari.com", "SaaS", "Jl. Asia Afrika, Bandung", -6.9218, 107.6102, "SaaS implementation for West Java SMEs."],
  ["bdg-qasir", "Qasir Bandung", "https://www.qasir.id", "SaaS", "Jl. Cihampelas, Bandung", -6.8944, 107.6042, "POS software with a large Bandung merchant base."],
  ["bdg-majoo", "majoo", "https://majoo.id", "SaaS", "Jl. Pasirkaliki, Bandung", -6.9084, 107.5992, "Cloud POS founded to serve F&B; strong Bandung presence."],
  ["bdg-privy", "Privy Bandung", "https://privy.id", "SaaS", "Jl. Diponegoro, Bandung", -6.9022, 107.6186, "e-KYC and signature onboarding for West Java enterprises."],
  ["bdg-nodeflux", "Nodeflux Bandung", "https://www.nodeflux.io", "AI", "Jl. Ganesha, Bandung", -6.8918, 107.6109, "Computer-vision engineering talent from ITB’s orbit."],
  ["bdg-kata", "Kata.ai Bandung", "https://kata.ai", "AI", "Jl. Dipatiukur, Bandung", -6.8878, 107.6156, "Conversational-AI engineering office."],
  ["bdg-traveloka", "Traveloka Bandung", "https://www.traveloka.com", "Travel", "Jl. Riau, Bandung", -6.9048, 107.6162, "Travel product and campus recruiting office."],
  ["bdg-tiket", "tiket.com Bandung", "https://www.tiket.com", "Travel", "Jl. Asia Afrika, Bandung", -6.9212, 107.6096, "Inventory and customer-ops for West Java travel."],
  ["bdg-halodoc", "Halodoc Bandung", "https://www.halodoc.com", "Health", "Jl. Pasteur, Bandung", -6.8964, 107.5998, "Clinic network and telemedicine partnerships."],
  ["bdg-ovo", "OVO Bandung", "https://www.ovo.id", "FinTech", "Paris Van Java, Bandung", -6.8892, 107.5956, "Merchant acquiring across Bandung retail."],
  ["bdg-dana", "DANA Bandung", "https://www.dana.id", "FinTech", "Jl. Cihampelas, Bandung", -6.8948, 107.6044, "Wallet city operations."],
  ["bdg-xendit", "Xendit Bandung", "https://www.xendit.co", "FinTech", "Jl. Dago, Bandung", -6.8856, 107.6138, "Payments engineering and campus hiring."],
  ["bdg-shipper", "Shipper Bandung", "https://shipper.id", "Logistics", "Jl. Soekarno-Hatta, Bandung", -6.9412, 107.6418, "Fulfilment for Bandung fashion and CMT sellers."],
  ["bdg-anteraja", "Anteraja Bandung", "https://anteraja.id", "Logistics", "Jl. Soekarno-Hatta, Bandung", -6.9422, 107.6442, "Parcel sortation for West Java."],
  ["bdg-idn", "IDN Bandung", "https://www.idn.media", "Media", "Jl. Ir. H. Djuanda, Bandung", -6.8842, 107.6182, "Youth media production in Bandung."],
  ["bdg-telkomsel", "Telkomsel Bandung", "https://www.telkomsel.com", "Telecom", "Jl. Japati, Bandung", -6.9148, 107.6092, "Telco digital products from Telkom’s Bandung campus."],
  ["bdg-indosat", "Indosat Bandung", "https://indosatooredoo.com", "Telecom", "Jl. Asia Afrika, Bandung", -6.9216, 107.6104, "Network and digital lifestyle office."],
  ["bdg-startup-campus", "Startup Campus Bandung", "https://startupcampus.id", "Hub", "Jl. Ganesha, Bandung", -6.8916, 107.6108, "Founder training programmes tied to the university belt.", "bandung-digital-valley"],
  ["bdg-locomote", "Locomote", "https://www.locomote.id", "SaaS", "Jl. Gegerkalong Hilir, Bandung", -6.9175, 107.6191, "Workforce and operations software from Bandung builders.", "bandung-digital-valley"],
  ["bdg-emveep", "Emveep", "https://www.emveep.com", "SaaS", "Jl. Dipatiukur, Bandung", -6.8882, 107.6148, "B2B software studio serving export manufacturers."],
  ["bdg-kargo", "Kargo Bandung", "https://kargo.tech", "Logistics", "Jl. Soekarno-Hatta, Bandung", -6.9402, 107.6406, "Digital freight for West Java industry."],
  ["bdg-paperid", "Paper.id Bandung", "https://www.paper.id", "SaaS", "Jl. Cihampelas, Bandung", -6.8938, 107.604, "Invoicing software city team."],
  ["bdg-colearn", "CoLearn Bandung", "https://www.colearn.id", "EdTech", "Jl. Dipatiukur, Bandung", -6.8872, 107.615, "STEM tutoring content and tutor ops."],
  ["bdg-sociolla", "Sociolla Bandung", "https://www.sociolla.com", "Marketplace", "Paris Van Java, Bandung", -6.889, 107.5954, "Beauty retail and fulfilment presence."],
];

const yogyakarta = [
  ["yog-jdv", "Jogja Digital Valley", "https://www.jogjadigitalvalley.com", "Hub", "Jl. Laksda Adisucipto, Yogyakarta", -7.7828, 110.3671, "Telkom’s Yogyakarta incubator for local product companies.", "yogyakarta-jdv"],
  ["yog-botika", "Botika", "https://botika.online", "AI", "Jl. Laksda Adisucipto, Yogyakarta", -7.7828, 110.3671, "Chatbot and conversational commerce platform from Yogyakarta.", "yogyakarta-jdv"],
  ["yog-klar", "KLAR Smile", "https://klar.co.id", "Health", "Jl. Palagan Tentara Pelajar, Yogyakarta", -7.7468, 110.3772, "DTC dental aligners brand with Yogyakarta operations."],
  ["yog-jala", "Jala Yogyakarta", "https://jala.tech", "AgriTech", "Jl. Kaliurang, Yogyakarta", -7.7554, 110.3816, "Aquaculture software with a Yogyakarta product presence."],
  ["yog-ugm", "UGM Science Techno Park", "https://ugm.ac.id", "Hub", "UGM Bulaksumur, Yogyakarta", -7.7712, 110.3775, "University commercialisation and deep-tech spinouts."],
  ["yog-amikom", "Amikom Startup", "https://home.amikom.ac.id", "Hub", "Jl. Ring Road Utara, Condongcatur, Yogyakarta", -7.7596, 110.4088, "Campus software and game studio pipeline."],
  ["yog-gojek", "Gojek Yogyakarta", "https://www.gojek.com", "Superapp", "Jl. Malioboro, Yogyakarta", -7.7926, 110.3658, "City operations for ride-hailing and GoFood."],
  ["yog-grab", "Grab Yogyakarta", "https://www.grab.com", "Superapp", "Jl. Affandi, Yogyakarta", -7.7758, 110.3884, "Grab city office for DIY."],
  ["yog-shopee", "Shopee Yogyakarta", "https://shopee.co.id", "Marketplace", "Jl. Laksda Adisucipto, Yogyakarta", -7.7832, 110.3876, "E-commerce ops for the Yogyakarta catchment."],
  ["yog-tokopedia", "Tokopedia Yogyakarta", "https://www.tokopedia.com", "Marketplace", "Jl. Gejayan, Yogyakarta", -7.7752, 110.3908, "Seller community office."],
  ["yog-bukalapak", "Bukalapak Yogyakarta", "https://www.bukalapak.com", "Marketplace", "Jl. Magelang, Yogyakarta", -7.7724, 110.3566, "Mitra network for Yogyakarta MSMEs."],
  ["yog-ruangguru", "Ruangguru Yogyakarta", "https://www.ruangguru.com", "EdTech", "Jl. Kaliurang, Yogyakarta", -7.7548, 110.3812, "Tutor supply and school partnerships."],
  ["yog-zenius", "Zenius Yogyakarta", "https://www.zenius.net", "EdTech", "Jl. C. Simanjuntak, Yogyakarta", -7.7822, 110.3744, "Learning content and campus ambassadors."],
  ["yog-dicoding", "Dicoding Yogyakarta", "https://www.dicoding.com", "EdTech", "Jl. Laksda Adisucipto, Yogyakarta", -7.7828, 110.3671, "Developer education community in Jogja.", "yogyakarta-jdv"],
  ["yog-mekari", "Mekari Yogyakarta", "https://mekari.com", "SaaS", "Jl. Magelang, Yogyakarta", -7.7736, 110.3562, "SaaS onboarding for Jogja SMEs."],
  ["yog-qasir", "Qasir Yogyakarta", "https://www.qasir.id", "SaaS", "Jl. Malioboro, Yogyakarta", -7.7932, 110.3656, "POS for Malioboro and traditional retailers."],
  ["yog-majoo", "majoo Yogyakarta", "https://majoo.id", "SaaS", "Jl. Prawirotaman, Yogyakarta", -7.8194, 110.3708, "Cloud POS for Jogja’s F&B street."],
  ["yog-halodoc", "Halodoc Yogyakarta", "https://www.halodoc.com", "Health", "Jl. Cik Di Tiro, Yogyakarta", -7.7756, 110.3748, "Clinic and hospital partnerships."],
  ["yog-traveloka", "Traveloka Yogyakarta", "https://www.traveloka.com", "Travel", "Jl. Malioboro, Yogyakarta", -7.7922, 110.3659, "Destination inventory for Jogja tourism."],
  ["yog-tiket", "tiket.com Yogyakarta", "https://www.tiket.com", "Travel", "Jl. Affandi, Yogyakarta", -7.7762, 110.3888, "Hotels and attractions booking ops."],
  ["yog-ovo", "OVO Yogyakarta", "https://www.ovo.id", "FinTech", "Plaza Ambarrukmo, Yogyakarta", -7.7826, 110.4012, "Merchant acquiring across Jogja retail."],
  ["yog-dana", "DANA Yogyakarta", "https://www.dana.id", "FinTech", "Jl. Gejayan, Yogyakarta", -7.775, 110.3904, "Wallet city operations."],
  ["yog-xendit", "Xendit Yogyakarta", "https://www.xendit.co", "FinTech", "Jl. Laksda Adisucipto, Yogyakarta", -7.7828, 110.3671, "Payments campus hiring and SME onboarding.", "yogyakarta-jdv"],
  ["yog-anteraja", "Anteraja Yogyakarta", "https://anteraja.id", "Logistics", "Jl. Maguwoharjo, Yogyakarta", -7.7672, 110.4096, "Parcel hub for DIY."],
  ["yog-shipper", "Shipper Yogyakarta", "https://shipper.id", "Logistics", "Jl. Laksda Adisucipto, Yogyakarta", -7.7836, 110.3922, "Fulfilment for Jogja crafts and F&B sellers."],
  ["yog-gits", "GITS Yogyakarta", "https://gits.id", "SaaS", "Jl. Kaliurang, Yogyakarta", -7.7562, 110.3822, "Software engineering office drawing Jogja talent."],
  ["yog-suitmedia", "Suitmedia Yogyakarta", "https://suitmedia.com", "SaaS", "Jl. C. Simanjuntak, Yogyakarta", -7.7824, 110.3746, "Product studio with a Yogyakarta team."],
];

const denpasar = [
  ["dps-hubud", "Hubud", "https://hubud.org", "Hub", "Jalan Monkey Forest, Ubud, Bali", -8.5192, 115.2598, "Long-running Ubud coworking community for product teams."],
  ["dps-dojo", "Dojo Bali", "https://www.dojobali.org", "Hub", "Batu Bolong, Canggu, Bali", -8.6476, 115.1386, "Canggu coworking campus used by SaaS and marketplace teams."],
  ["dps-outpost", "Outpost", "https://outpost.asia", "Hub", "Batu Bolong, Canggu, Bali", -8.6488, 115.1372, "Coliving and coworking network with a flagship Canggu site."],
  ["dps-gowork", "GoWork Bali", "https://gowork.id", "Hub", "Kuta / Denpasar, Bali", -8.7234, 115.1842, "Flexible workspace for Indonesian and regional startups."],
  ["dps-gojek", "Gojek Bali", "https://www.gojek.com", "Superapp", "Jl. Teuku Umar, Denpasar", -8.6708, 115.2124, "Island operations for mobility and GoFood."],
  ["dps-grab", "Grab Bali", "https://www.grab.com", "Superapp", "Jl. Imam Bonjol, Denpasar", -8.6786, 115.2048, "Grab Bali city office."],
  ["dps-traveloka", "Traveloka Bali", "https://www.traveloka.com", "Travel", "Jl. By Pass Ngurah Rai, Denpasar", -8.7284, 115.1846, "Destination and experiences team for Bali inventory."],
  ["dps-tiket", "tiket.com Bali", "https://www.tiket.com", "Travel", "Jl. Teuku Umar, Denpasar", -8.6712, 115.2118, "Hotels and attractions operations."],
  ["dps-pegipegi", "Pegipegi Bali", "https://www.pegipegi.com", "Travel", "Jl. Diponegoro, Denpasar", -8.6702, 115.2166, "Hotel marketplace island team."],
  ["dps-tokopedia", "Tokopedia Bali", "https://www.tokopedia.com", "Marketplace", "Jl. Teuku Umar, Denpasar", -8.6706, 115.2128, "Seller community for Bali crafts and F&B."],
  ["dps-shopee", "Shopee Bali", "https://shopee.co.id", "Marketplace", "Jl. Gatot Subroto, Denpasar", -8.6368, 115.2294, "E-commerce ops and last mile."],
  ["dps-bukalapak", "Bukalapak Bali", "https://www.bukalapak.com", "Marketplace", "Jl. Gajah Mada, Denpasar", -8.6568, 115.2158, "Mitra network across Bali."],
  ["dps-ruangguru", "Ruangguru Bali", "https://www.ruangguru.com", "EdTech", "Jl. Hayam Wuruk, Denpasar", -8.6724, 115.2268, "School partnerships in Denpasar."],
  ["dps-halodoc", "Halodoc Bali", "https://www.halodoc.com", "Health", "Jl. Diponegoro, Denpasar", -8.6698, 115.2172, "Clinic and hospital network for Bali."],
  ["dps-ovo", "OVO Bali", "https://www.ovo.id", "FinTech", "Beachwalk, Kuta", -8.7196, 115.1698, "Merchant acquiring for tourism retail."],
  ["dps-dana", "DANA Bali", "https://www.dana.id", "FinTech", "Jl. Teuku Umar, Denpasar", -8.671, 115.2122, "Wallet city operations."],
  ["dps-xendit", "Xendit Bali", "https://www.xendit.co", "FinTech", "Canggu, Bali", -8.6478, 115.1388, "Payments team with a Bali engineering presence."],
  ["dps-mekari", "Mekari Bali", "https://mekari.com", "SaaS", "Jl. Teuku Umar, Denpasar", -8.6714, 115.2116, "SaaS for Bali hospitality SMEs."],
  ["dps-majoo", "majoo Bali", "https://majoo.id", "SaaS", "Jl. Legian, Kuta", -8.7148, 115.1726, "Cloud POS widely used by Bali F&B."],
  ["dps-qasir", "Qasir Bali", "https://www.qasir.id", "SaaS", "Pasar Badung, Denpasar", -8.6564, 115.2152, "Warung POS across Denpasar markets."],
  ["dps-shipper", "Shipper Bali", "https://shipper.id", "Logistics", "Jl. Bypass Ngurah Rai, Denpasar", -8.7268, 115.1862, "Fulfilment for island sellers."],
  ["dps-anteraja", "Anteraja Bali", "https://anteraja.id", "Logistics", "Jl. Bypass Ngurah Rai, Denpasar", -8.7274, 115.1854, "Parcel hub for Bali."],
  ["dps-idn", "IDN Bali", "https://www.idn.media", "Media", "Canggu, Bali", -8.6492, 115.1378, "Youth media production on the island."],
  ["dps-kopikenangan", "Kopi Kenangan Bali", "https://kopikenangan.com", "Consumer", "Jl. Teuku Umar, Denpasar", -8.6704, 115.2126, "Tech-enabled coffee chain with dense Bali stores."],
  ["dps-sociolla", "Sociolla Bali", "https://www.sociolla.com", "Marketplace", "Beachwalk, Kuta", -8.7198, 115.1696, "Beauty retail presence."],
  ["dps-efishery", "eFishery Bali", "https://efishery.com", "AgriTech", "Kabupaten Gianyar / Denpasar office", -8.5408, 115.3254, "Aquaculture coverage for Bali ponds."],
  ["dps-klook", "Klook Bali", "https://www.klook.com", "Travel", "Jl. Bypass Ngurah Rai, Denpasar", -8.7292, 115.1842, "Experiences marketplace destination team."],
  ["dps-kargo", "Kargo Bali", "https://kargo.tech", "Logistics", "Jl. Gatot Subroto, Denpasar", -8.6372, 115.2298, "Island freight for hospitality supply chains."],
  ["dps-privy", "Privy Bali", "https://privy.id", "SaaS", "Jl. Teuku Umar, Denpasar", -8.6716, 115.2114, "Digital signature onboarding for tourism groups."],
  ["dps-startup-bali", "Startup Bali", "https://startupbali.org", "Hub", "Denpasar, Bali", -8.6705, 115.2126, "Island founder community and events."],
];

const medan = [
  ["mdn-gojek", "Gojek Medan", "https://www.gojek.com", "Superapp", "Jl. Gatot Subroto, Medan", 3.5912, 98.6694, "North Sumatra operations for Gojek."],
  ["mdn-grab", "Grab Medan", "https://www.grab.com", "Superapp", "Jl. Imam Bonjol, Medan", 3.5876, 98.6782, "Grab city office for Medan."],
  ["mdn-shopee", "Shopee Medan", "https://shopee.co.id", "Marketplace", "Jl. Gatot Subroto, Medan", 3.5908, 98.6688, "E-commerce hub for North Sumatra."],
  ["mdn-tokopedia", "Tokopedia Medan", "https://www.tokopedia.com", "Marketplace", "Centre Point, Medan", 3.5894, 98.6756, "Seller community office."],
  ["mdn-bukalapak", "Bukalapak Medan", "https://www.bukalapak.com", "Marketplace", "Jl. Gajah Mada, Medan", 3.5898, 98.6724, "Mitra network."],
  ["mdn-traveloka", "Traveloka Medan", "https://www.traveloka.com", "Travel", "Kualanamu / Medan city office", 3.5952, 98.6722, "Flights and hotels inventory for Sumatra."],
  ["mdn-ruangguru", "Ruangguru Medan", "https://www.ruangguru.com", "EdTech", "Jl. Diponegoro, Medan", 3.5846, 98.6788, "School partnerships in Medan."],
  ["mdn-mekari", "Mekari Medan", "https://mekari.com", "SaaS", "Jl. Putri Hijau, Medan", 3.5958, 98.6784, "Cloud software for Medan SMEs."],
  ["mdn-qasir", "Qasir Medan", "https://www.qasir.id", "SaaS", "Pasar Petisah, Medan", 3.5954, 98.6702, "Warung POS across Medan markets."],
  ["mdn-majoo", "majoo Medan", "https://majoo.id", "SaaS", "Jl. Ring Road, Medan", 3.5628, 98.6564, "Cloud POS for F&B."],
  ["mdn-ovo", "OVO Medan", "https://www.ovo.id", "FinTech", "Sun Plaza, Medan", 3.5892, 98.6786, "Merchant acquiring."],
  ["mdn-dana", "DANA Medan", "https://www.dana.id", "FinTech", "Centre Point, Medan", 3.5896, 98.6758, "Wallet city operations."],
  ["mdn-halodoc", "Halodoc Medan", "https://www.halodoc.com", "Health", "Jl. Diponegoro, Medan", 3.5848, 98.6792, "Clinic network for Medan."],
  ["mdn-xendit", "Xendit Medan", "https://www.xendit.co", "FinTech", "Jl. Putri Hijau, Medan", 3.596, 98.6786, "Payments onboarding for Sumatran merchants."],
  ["mdn-anteraja", "Anteraja Medan", "https://anteraja.id", "Logistics", "Jl. Gatot Subroto, Medan", 3.5916, 98.669, "Parcel hub."],
  ["mdn-shipper", "Shipper Medan", "https://shipper.id", "Logistics", "Jl. Gatot Subroto, Medan", 3.5918, 98.6686, "Fulfilment for Medan sellers."],
  ["mdn-telkomsel", "Telkomsel Medan", "https://www.telkomsel.com", "Telecom", "Jl. Imam Bonjol, Medan", 3.5878, 98.6778, "Telco digital services."],
  ["mdn-indosat", "Indosat Medan", "https://indosatooredoo.com", "Telecom", "Jl. Gatot Subroto, Medan", 3.5904, 98.6698, "Network and digital lifestyle office."],
  ["mdn-bank-sumut", "Bank Sumut Digital", "https://www.banksumut.co.id", "FinTech", "Jl. Imam Bonjol, Medan", 3.5882, 98.6772, "Regional bank digital channels."],
  ["mdn-usu", "USU Innovation", "https://www.usu.ac.id", "Hub", "Universitas Sumatera Utara, Medan", 3.5618, 98.6544, "Campus commercialisation and student startups."],
  ["mdn-del", "Institut Del alumni hub", "https://www.del.ac.id", "Hub", "Medan talent office", 3.5952, 98.6722, "North Sumatra software-engineering talent pipeline with a Medan presence."],
  ["mdn-blibli", "Blibli Medan", "https://www.blibli.com", "Marketplace", "Sun Plaza, Medan", 3.589, 98.6784, "Omnichannel retail presence."],
  ["mdn-tiket", "tiket.com Medan", "https://www.tiket.com", "Travel", "Kualanamu corridor, Medan", 3.6322, 98.8736, "Airport-city travel operations."],
  ["mdn-privy", "Privy Medan", "https://privy.id", "SaaS", "Jl. Putri Hijau, Medan", 3.5956, 98.6788, "e-signature onboarding."],
  ["mdn-kargo", "Kargo Medan", "https://kargo.tech", "Logistics", "Belawan / Medan industrial", 3.7724, 98.6832, "Digital freight for Belawan port traffic."],
];

const batam = [
  ["btm-nongsa", "Nongsa Digital Park", "https://nongsadigitalpark.com", "Hub", "Nongsa Digital Park, Batam", 1.1855, 104.0945, "Batam’s flagship digital campus facing Singapore.", "batam-nongsa"],
  ["btm-block71", "BLOCK71 Batam", "https://block71.co", "Hub", "Nongsa Digital Park, Batam", 1.1855, 104.0945, "NUS Enterprise’s Batam extension of the BLOCK71 network.", "batam-nongsa"],
  ["btm-infinite", "Infinite Studios", "https://infinitestudios.sg", "Media", "Nongsa, Batam", 1.1872, 104.0938, "Sound stages and digital production campus in Nongsa.", "batam-nongsa"],
  ["btm-bp-batam", "BP Batam digital", "https://bpbatam.go.id", "CivicTech", "Batam Centre, Batam", 1.1296, 104.0534, "Free-trade-zone authority digital services."],
  ["btm-gojek", "Gojek Batam", "https://www.gojek.com", "Superapp", "Nagoya, Batam", 1.1456, 104.0148, "City operations for Batam mobility and food."],
  ["btm-grab", "Grab Batam", "https://www.grab.com", "Superapp", "Batam Centre", 1.1288, 104.0528, "Grab office serving the Singapore–Batam corridor."],
  ["btm-shopee", "Shopee Batam", "https://shopee.co.id", "Marketplace", "Batam Centre", 1.1292, 104.0532, "Cross-border e-commerce ops."],
  ["btm-tokopedia", "Tokopedia Batam", "https://www.tokopedia.com", "Marketplace", "Nagoya, Batam", 1.1452, 104.0152, "Seller community for Batam trade."],
  ["btm-traveloka", "Traveloka Batam", "https://www.traveloka.com", "Travel", "Batam Centre ferry terminal precinct", 1.1304, 104.0522, "Ferry, flight, and hotel inventory for the island."],
  ["btm-xendit", "Xendit Batam", "https://www.xendit.co", "FinTech", "Nongsa Digital Park, Batam", 1.1855, 104.0945, "Payments engineering near the Singapore talent pool.", "batam-nongsa"],
  ["btm-mekari", "Mekari Batam", "https://mekari.com", "SaaS", "Nagoya, Batam", 1.1458, 104.0146, "SaaS for Batam manufacturers and traders."],
  ["btm-ovo", "OVO Batam", "https://www.ovo.id", "FinTech", "Nagoya Hill, Batam", 1.1462, 104.0138, "Merchant acquiring."],
  ["btm-dana", "DANA Batam", "https://www.dana.id", "FinTech", "Batam Centre", 1.1294, 104.053, "Wallet city operations."],
  ["btm-halodoc", "Halodoc Batam", "https://www.halodoc.com", "Health", "Awal Bros / Nagoya, Batam", 1.1474, 104.0166, "Clinic partnerships."],
  ["btm-anteraja", "Anteraja Batam", "https://anteraja.id", "Logistics", "Batu Ampar, Batam", 1.1638, 104.0024, "Parcel hub next to the port."],
  ["btm-shipper", "Shipper Batam", "https://shipper.id", "Logistics", "Batu Ampar, Batam", 1.1642, 104.002, "Cross-border fulfilment."],
  ["btm-telkomsel", "Telkomsel Batam", "https://www.telkomsel.com", "Telecom", "Batam Centre", 1.1286, 104.0536, "Telco digital services for the FTZ."],
  ["btm-indosat", "Indosat Batam", "https://indosatooredoo.com", "Telecom", "Nagoya, Batam", 1.1454, 104.015, "Network office."],
  ["btm-nongsa-point", "Nongsa Point Marina digital", "https://nongsapointmarina.com", "Hub", "Nongsa Point, Batam", 1.1708, 104.1072, "Marina precinct used by visiting Singapore product teams."],
  ["btm-kargo", "Kargo Batam", "https://kargo.tech", "Logistics", "Batu Ampar, Batam", 1.1646, 104.0016, "Digital freight for industrial Batam."],
];

const suva = [
  ["suv-fiji-innovation", "Fiji Innovation Hub", "https://www.rbf.gov.fj", "Hub", "Reserve Bank precinct, Suva", -18.1416, 178.4419, "Fintech and founder programmes backed by RBF, UNCDF, and Creative HQ.", "suva-innovation-hub"],
  ["suv-itgalax", "ITGalax", "https://www.itgalax.com", "FinTech", "Suva CBD", -18.1418, 178.4416, "Suva fintech recognised in Pacific FinTech Challenge programmes.", "suva-innovation-hub"],
  ["suv-datec", "Datec Fiji", "https://www.datec.com.fj", "Enterprise", "68 Gordon St, Suva", -18.1432, 178.4248, "Long-running Pacific technology integrator headquartered in Suva."],
  ["suv-vodafone", "Vodafone Fiji", "https://www.vodafone.com.fj", "Telecom", "168 Princes Rd, Tamavua, Suva", -18.1168, 178.4506, "Mobile network and M-PAiSA operator."],
  ["suv-digicel", "Digicel Fiji", "https://www.digicelgroup.com", "Telecom", "Suva CBD", -18.1412, 178.4412, "Mobile and digital services across Fiji."],
  ["suv-telecom-fiji", "Telecom Fiji", "https://www.tfl.com.fj", "Telecom", "Edward St, Suva", -18.1406, 178.4256, "Fixed and broadband operator in the ATH group."],
  ["suv-ath", "Amalgamated Telecom Holdings", "https://www.ath.com.fj", "Telecom", "Harbour Front, Suva", -18.1368, 178.4242, "Fiji’s listed telecom holding company."],
  ["suv-hfc", "HFC Bank", "https://www.hfc.com.fj", "FinTech", "371 Victoria Parade, Suva", -18.1364, 178.4248, "Local bank partnering with the Fiji Innovation Hub."],
  ["suv-kontiki", "Kontiki Finance", "https://www.kontikifinance.com", "FinTech", "Suva CBD", -18.1408, 178.4252, "Consumer and SME finance with digital origination."],
  ["suv-bsp", "BSP Fiji", "https://www.bsp.com.fj", "FinTech", "Suva CBD", -18.141, 178.4246, "Regional bank digital channels."],
  ["suv-usp", "USP Innovation", "https://www.usp.ac.fj", "Hub", "Laucala Campus, Suva", -18.1492, 178.4496, "University of the South Pacific ICT and entrepreneurship programmes."],
  ["suv-fnu", "FNU ICT", "https://www.fnu.ac.fj", "EdTech", "Derrick Campus, Samabula, Suva", -18.1418, 178.4508, "Applied ICT training and student ventures."],
  ["suv-connect", "Connect Fiji", "https://www.connect.com.fj", "Telecom", "Suva", -18.1424, 178.4262, "Internet service provider."],
  ["suv-fintel", "FINTEL", "https://www.fintel.com.fj", "Telecom", "Suva", -18.1358, 178.4238, "International connectivity operator."],
  ["suv-merchant-finance", "Merchant Finance", "https://www.mfl.com.fj", "FinTech", "Suva CBD", -18.1404, 178.4258, "Asset finance with digital applications."],
  ["suv-cybase", "Cybase", "https://www.cybase.com.fj", "SaaS", "Suva CBD", -18.1422, 178.4254, "Local software and systems integrator."],
  ["suv-south-pacific-computers", "South Pacific Computers", "https://www.spc.com.fj", "Enterprise", "Suva", -18.1436, 178.4268, "Hardware and enterprise IT services."],
  ["suv-communications-fiji", "Communications Fiji", "https://www.cfi.com.fj", "Media", "Suva", -18.1442, 178.4272, "Broadcast and digital media group."],
  ["suv-fijivillage", "Fijivillage", "https://www.fijivillage.com", "Media", "Suva", -18.1414, 178.4264, "Digital news platform."],
  ["suv-un-cdf", "UNCDF Pacific", "https://www.uncdf.org", "FinTech", "Suva", -18.1416, 178.4419, "Pacific Digital Economy Programme team supporting local fintechs.", "suva-innovation-hub"],
];

const nadi = [
  ["ndi-ignite", "Ignite Pacific", "https://ignitepacific.com", "SaaS", "Nadi, Fiji", -17.7765, 177.4356, "Software, cybersecurity, and BulaWork recruitment tech based in Nadi."],
  ["ndi-bulawork", "BulaWork", "https://bulawork.com", "SaaS", "Nadi, Fiji", -17.7772, 177.4362, "AI recruitment platform for Pacific talent, built by Ignite Pacific."],
  ["ndi-easysign", "EasySign", "https://ignitepacific.com", "SaaS", "Nadi, Fiji", -17.7768, 177.4358, "Digital signatures product for Pacific businesses."],
  ["ndi-fiji-airways", "Fiji Airways digital", "https://www.fijiairways.com", "Travel", "Nasoso Rd, Nadi Airport", -17.7554, 177.4436, "Airline digital and loyalty products at Nadi Airport."],
  ["ndi-tourism-fiji", "Tourism Fiji", "https://www.fiji.travel", "Travel", "Nadi", -17.7748, 177.4312, "Destination marketing and booking tech."],
  ["ndi-airports-fiji", "Airports Fiji", "https://www.airportsfiji.com", "Travel", "Nadi Airport", -17.7558, 177.4432, "Airport operator digital services."],
  ["ndi-vodafone-nadi", "Vodafone Nadi", "https://www.vodafone.com.fj", "Telecom", "Namaka, Nadi", -17.7762, 177.4168, "Retail and mobile-money presence in Nadi."],
  ["ndi-digicel-nadi", "Digicel Nadi", "https://www.digicelgroup.com", "Telecom", "Nadi town", -17.7768, 177.4352, "Mobile services for the western division."],
  ["ndi-westpac-nadi", "Westpac Nadi digital", "https://www.westpac.com.fj", "FinTech", "Nadi town", -17.7774, 177.435, "Retail banking digital channels."],
  ["ndi-anz-nadi", "ANZ Nadi", "https://www.anz.com/fiji", "FinTech", "Main St, Nadi", -17.7776, 177.4348, "Banking services for tourism and SMEs."],
  ["ndi-bsp-nadi", "BSP Nadi", "https://www.bsp.com.fj", "FinTech", "Nadi town", -17.777, 177.4354, "Regional bank branch and digital onboarding."],
  ["ndi-datec-nadi", "Datec Nadi", "https://www.datec.com.fj", "Enterprise", "Namaka, Nadi", -17.7764, 177.4172, "IT services for western Fiji corporates."],
  ["ndi-unwired", "Unwired Fiji", "https://www.unwired.com.fj", "Telecom", "Nadi", -17.7756, 177.4328, "Wireless broadband provider."],
  ["ndi-connect-nadi", "Connect Nadi", "https://www.connect.com.fj", "Telecom", "Nadi", -17.7758, 177.4334, "ISP serving the west."],
  ["ndi-jacks", "Jacks Travel digital", "https://www.jacksfiji.com", "Travel", "Nadi Airport corridor", -17.7608, 177.4472, "Destination operator with digital booking tools."],
];

const noumea = [
  ["nou-opt", "OPT-NC", "https://www.opt.nc", "Telecom", "Nouméa Centre", -22.2758, 166.458, "New Caledonia’s public telecom and digital services operator."],
  ["nou-startup-nc", "Start-up NC", "https://www.startup.nc", "Hub", "Nouméa", -22.2712, 166.4418, "Local startup association and founder programmes."],
  ["nou-adecal", "ADECAL Technopole", "https://www.adecal.nc", "Hub", "Nouville, Nouméa", -22.2624, 166.4366, "Technopole supporting marine, digital, and agri ventures."],
  ["nou-nautile", "Nautile", "https://www.nautile.nc", "Telecom", "Nouméa", -22.2764, 166.4572, "Internet and hosting provider."],
  ["nou-offratel", "Offratel", "https://www.offratel.nc", "Telecom", "Nouméa", -22.2748, 166.4564, "Telecom reseller and digital services."],
  ["nou-caledonie-bb", "Calédonie Broadband", "https://www.caledonie-broadband.nc", "Telecom", "Nouméa", -22.2772, 166.4592, "Broadband operator."],
  ["nou-canl", "Canal+ Calédonie digital", "https://www.canalplus-caledonie.com", "Media", "Nouméa", -22.2784, 166.4586, "Broadcast and streaming operations."],
  ["nou-aircalin", "Aircalin digital", "https://www.aircalin.com", "Travel", "Magenta / Nouméa", -22.2612, 166.4728, "Airline digital and loyalty products."],
  ["nou-unc", "Université de la Nouvelle-Calédonie", "https://unc.nc", "EdTech", "Nouville, Nouméa", -22.2618, 166.4338, "University innovation and digital programmes."],
  ["nou-cci", "CCI-NC Innovation", "https://www.cci.nc", "Hub", "Nouméa", -22.2736, 166.4452, "Chamber programmes for digital SMEs."],
  ["nou-gie-tourisme", "GIE Tourisme", "https://www.newcaledonia.travel", "Travel", "Nouméa", -22.2768, 166.4436, "Destination platform and visitor tech."],
  ["nou-enercal", "Enercal digital", "https://www.enercal.nc", "Energy", "Nouméa", -22.2694, 166.4488, "Utility digital customer channels."],
  ["nou-eec", "EEC", "https://www.eec.nc", "Energy", "Nouméa", -22.2708, 166.4502, "Electricity distributor digital services."],
  ["nou-lnc", "Les Nouvelles Calédoniennes", "https://www.lnc.nc", "Media", "Nouméa", -22.2742, 166.4478, "Digital newsroom."],
  ["nou-scale", "Scale-1", "https://www.scale-1.nc", "SaaS", "Nouméa", -22.2726, 166.4448, "Local digital product studio."],
];

const portVila = [
  ["vil-interchange", "Interchange Limited", "https://www.interchange.vu", "Telecom", "Port Vila", -17.7334, 168.3272, "Submarine-cable company connecting Vanuatu."],
  ["vil-digicel", "Digicel Vanuatu", "https://www.digicelvanuatu.com", "Telecom", "Port Vila", -17.7342, 168.3264, "Mobile network and mobile-money services."],
  ["vil-vodafone", "Vodafone Vanuatu", "https://www.vodafone.com.vu", "Telecom", "Port Vila", -17.7328, 168.3278, "Mobile and digital services."],
  ["vil-wantok", "Wantok", "https://www.wantok.vu", "Telecom", "Port Vila", -17.7338, 168.3258, "Local mobile brand."],
  ["vil-tvl", "Telecom Vanuatu", "https://www.tvl.vu", "Telecom", "Port Vila", -17.7346, 168.3268, "Incumbent fixed and mobile operator."],
  ["vil-rbv", "Reserve Bank of Vanuatu", "https://www.rbv.gov.vu", "FinTech", "Port Vila", -17.7318, 168.3284, "Regulator supporting digital finance innovation."],
  ["vil-nbv", "National Bank of Vanuatu", "https://www.nbv.vu", "FinTech", "Port Vila", -17.7332, 168.3262, "Local bank digital channels."],
  ["vil-wanfuteng", "Wanfuteng Bank", "https://www.wanfutengbank.com", "FinTech", "Port Vila", -17.734, 168.3274, "Indigenous-owned bank with digital services."],
  ["vil-tourism", "Vanuatu Tourism", "https://vanuatu.travel", "Travel", "Port Vila", -17.7324, 168.3254, "Destination marketing and visitor information tech."],
  ["vil-air-vanuatu", "Air Vanuatu digital", "https://www.airvanuatu.com", "Travel", "Bauerfield, Port Vila", -17.6992, 168.32, "Airline digital products."],
  ["vil-uncdf", "UNCDF Vanuatu", "https://www.uncdf.org", "FinTech", "Port Vila", -17.7336, 168.327, "Digital finance programmes with local partners."],
  ["vil-further-arts", "Further Arts", "https://furtherarts.org", "Media", "Port Vila", -17.7352, 168.3248, "Creative-tech and digital culture organisation."],
];

const honiara = [
  ["hon-our-telekom", "Our Telekom", "https://www.telekom.com.sb", "Telecom", "Honiara", -9.434, 159.954, "Solomon Islands incumbent telecom."],
  ["hon-bemobile", "Bemobile", "https://www.bemobile.com.sb", "Telecom", "Honiara", -9.4362, 159.9558, "Mobile network operator."],
  ["hon-satsol", "SATSOL", "https://www.satsol.net", "Telecom", "Honiara", -9.4374, 159.9582, "Satellite and ISP services."],
  ["hon-island-tech", "Island Tech / KlikPei", "https://klikpei.com", "Marketplace", "Honiara", -9.4336, 159.9528, "E-commerce aggregator launched in the Solomons."],
  ["hon-cbsi", "Central Bank of Solomon Islands", "https://www.cbsi.com.sb", "FinTech", "Honiara", -9.4318, 159.9496, "Regulator working on digital payments and inclusion."],
  ["hon-bsp", "BSP Solomon Islands", "https://www.bsp.com.sb", "FinTech", "Honiara", -9.4348, 159.9536, "Regional bank digital channels."],
  ["hon-anz", "ANZ Honiara", "https://www.anz.com/solomonislands", "FinTech", "Honiara", -9.4352, 159.9544, "Banking services in Point Cruz."],
  ["hon-pob", "Pan Oceanic Bank", "https://www.pob.com.sb", "FinTech", "Honiara", -9.4344, 159.9532, "Local commercial bank."],
  ["hon-solomon-power", "Solomon Power", "https://www.solomonpower.com.sb", "Energy", "Ranadi, Honiara", -9.4286, 160.0024, "Utility digital customer services."],
  ["hon-solomon-air", "Solomon Airlines digital", "https://www.flysolomons.com", "Travel", "Honiara", -9.428, 160.0546, "Airline digital and booking products."],
  ["hon-sinu", "SINU ICT", "https://www.sinu.edu.sb", "EdTech", "Kukum, Honiara", -9.4378, 160.0188, "National university ICT programmes."],
  ["hon-dtu", "Digital Transformation Unit", "https://www.ict.gov.sb", "CivicTech", "Honiara", -9.4332, 159.9518, "Government digital services team."],
];

const portMoresby = [
  ["pom-niupay", "NiuPay", "https://niupay.com.pg", "SaaS", "Port Moresby", -9.4438, 147.1803, "PNG-built public-sector digital payments and services platform.", "port-moresby-harbour-city"],
  ["pom-kina", "Kina Bank", "https://www.kinabank.com.pg", "FinTech", "Harbour City, Port Moresby", -9.4785, 147.1492, "Digital-forward PNG bank and NiuPay investor.", "port-moresby-harbour-city"],
  ["pom-bsp", "BSP PNG", "https://www.bsp.com.pg", "FinTech", "Douglas St, Port Moresby", -9.4788, 147.1508, "Largest PNG bank with expanding digital channels."],
  ["pom-digicel", "Digicel PNG", "https://www.digicelpng.com", "Telecom", "Port Moresby", -9.4672, 147.1604, "Mobile network and mobile-money operator."],
  ["pom-vodafone", "Vodafone PNG", "https://www.vodafone.com.pg", "Telecom", "Port Moresby", -9.4668, 147.1598, "Mobile competitor network."],
  ["pom-telikom", "Telikom PNG", "https://www.telikom.com.pg", "Telecom", "Port Moresby", -9.4654, 147.1586, "Incumbent fixed and broadband."],
  ["pom-dataco", "DataCo", "https://www.datacopng.com", "Telecom", "Port Moresby", -9.4648, 147.1572, "National wholesale data and cable operator."],
  ["pom-datec", "Datec PNG", "https://www.datec.com.pg", "Enterprise", "Port Moresby", -9.4782, 147.1502, "Enterprise IT integrator.", "port-moresby-harbour-city"],
  ["pom-daltron", "Daltron", "https://www.daltron.com.pg", "Enterprise", "Port Moresby", -9.4768, 147.1524, "Hardware, cloud, and enterprise services."],
  ["pom-steamships", "Steamships digital", "https://www.steamships.com.pg", "Enterprise", "Port Moresby", -9.4792, 147.1498, "Conglomerate digital and logistics platforms.", "port-moresby-harbour-city"],
  ["pom-airniugini", "Air Niugini digital", "https://www.airniugini.com.pg", "Travel", "Jacksons, Port Moresby", -9.4436, 147.2202, "National airline digital products."],
  ["pom-pngair", "PNG Air digital", "https://www.pngair.com.pg", "Travel", "Port Moresby", -9.4442, 147.2188, "Domestic airline booking tech."],
  ["pom-nasfund", "NASFUND digital", "https://www.nasfund.com.pg", "FinTech", "Port Moresby", -9.4774, 147.1516, "Superannuation digital member services."],
  ["pom-nambawan", "Nambawan Super", "https://www.nambawansuper.com.pg", "FinTech", "Port Moresby", -9.4766, 147.1528, "Super fund digital channels."],
  ["pom-mibank", "MiBank", "https://www.mibank.com.pg", "FinTech", "Port Moresby", -9.4694, 147.1578, "Microfinance bank with mobile channels."],
  ["pom-moniplus", "Moni Plus", "https://www.moniplus.com.pg", "FinTech", "Port Moresby", -9.4688, 147.1584, "Digital credit and wallet services."],
  ["pom-upng", "UPNG ICT", "https://www.upng.ac.pg", "EdTech", "Waigani, Port Moresby", -9.4086, 147.1728, "University ICT and innovation programmes."],
  ["pom-innovate", "Innovate PNG", "https://www.innovation.gov.pg", "Hub", "Waigani, Port Moresby", -9.4288, 147.1806, "National innovation policy and founder programmes."],
  ["pom-city-pharmacy", "City Pharmacy digital", "https://www.cpl.com.pg", "Health", "Port Moresby", -9.4752, 147.1542, "Retail pharmacy group e-commerce and loyalty."],
  ["pom-bemobile", "Bemobile PNG", "https://www.bemobile.com.pg", "Telecom", "Port Moresby", -9.4662, 147.1608, "Mobile network."],
];

function mergeBuildings() {
  const buildingsPath = path.join(dataDir, "buildings.json");
  const existing = JSON.parse(fs.readFileSync(buildingsPath, "utf8"));
  const byId = new Map(existing.map((b) => [b.id, b]));
  for (const [id, meta] of Object.entries(BUILDINGS)) {
    byId.set(id, {
      id,
      name: meta.name,
      city: meta.city,
      lat: meta.lat,
      lng: meta.lng,
    });
  }
  const merged = [...byId.values()];
  fs.writeFileSync(buildingsPath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`buildings: ${merged.length}`);
}

writeCity("auckland", auckland);
writeCity("wellington", wellington);
writeCity("christchurch", christchurch);
writeCity("singapore", singapore);
writeCity("jakarta", jakarta);
writeCity("surabaya", surabaya);
writeCity("bandung", bandung);
writeCity("yogyakarta", yogyakarta);
writeCity("denpasar", denpasar);
writeCity("medan", medan);
writeCity("batam", batam);
writeCity("suva", suva);
writeCity("nadi", nadi);
writeCity("noumea", noumea);
writeCity("port-vila", portVila);
writeCity("honiara", honiara);
writeCity("port-moresby", portMoresby);
mergeBuildings();
console.log("regional seeds written");
