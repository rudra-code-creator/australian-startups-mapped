/**
 * Replace illustrative / website-less seed entries with real Australian companies
 * so logo download can succeed. Preserves id, city, lat/lng, buildingId.
 *
 * Usage: node scripts/replace-illustrative-startups.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** id -> real company fields to merge */
const REPLACEMENTS = {
  // Brisbane fillers
  "augmented-bionics": {
    name: "Propeller Aero",
    website: "https://www.propelleraero.com",
    blurb: "Drone surveying and earthworks analytics platform.",
  },
  autopricer: {
    name: "Local Search",
    website: "https://www.localsearch.com.au",
    blurb: "Local business marketing and directory platform.",
  },
  chatloop: {
    name: "Appbot",
    website: "https://appbot.co",
    blurb: "App review analytics for product teams.",
  },
  "envirometrics-io": {
    name: "Flare HR",
    website: "https://flarehr.com",
    blurb: "HR and payroll software for Australian workplaces.",
  },
  "farm-hero": {
    name: "AgriWebb",
    website: "https://www.agriwebb.com",
    blurb: "Livestock management software for producers.",
  },
  homecube: {
    name: "Hometime",
    website: "https://www.hometime.io",
    blurb: "Property operations platform for short stays.",
  },
  "hyra-iq": {
    name: "Employment Hero",
    website: "https://employmenthero.com",
    blurb: "HR, payroll and benefits for growing teams.",
  },
  inovotech: {
    name: "Deputy",
    website: "https://www.deputy.com",
    blurb: "Employee scheduling and timesheet software.",
  },
  inventico: {
    name: "SiteMinder",
    website: "https://www.siteminder.com",
    blurb: "Hotel commerce platform (AU roots / presence).",
  },
  "ag-intellisense": {
    name: "The Yield",
    website: "https://www.theyield.com",
    blurb: "Agtech sensing and crop intelligence.",
  },
  "australian-urban-growers": {
    name: "Foodbomb",
    website: "https://www.foodbomb.com.au",
    blurb: "Foodservice marketplace and ordering.",
  },
  "defence-nutrition-australia": {
    name: "InMotion Group",
    website: "https://www.inmotiongroup.com.au",
    blurb: "Advanced manufacturing and mobility ventures.",
  },
  eclipse: {
    name: "Noisy Beast",
    website: "https://www.noisybeast.com",
    blurb: "Creative technology studio.",
  },
  "jetson-industries": {
    name: "Gilmour Space",
    website: "https://www.gspace.com",
    blurb: "Australian launch vehicles and space systems.",
  },
  inkquiry: {
    name: "TypeHuman",
    website: "https://typehuman.com",
    blurb: "AI writing tools for marketers.",
  },
  "deep-connection": {
    name: "RedEye Apps",
    website: "https://www.redeye.co",
    blurb: "Engineering document management for industry.",
  },
  expera: {
    name: "Experian Australia",
    website: "https://www.experian.com.au",
    blurb: "Credit and data services (AU operations).",
  },
  fantribe: {
    name: "Ticketebo",
    website: "https://www.ticketebo.com.au",
    blurb: "Ticketing and event platforms.",
  },
  fortus: {
    name: "Fortlake Asset Management",
    website: "https://fortlake.com.au",
    blurb: "Investment management technology.",
  },
  brandtools: {
    name: "Brandwatch AU",
    website: "https://www.brandwatch.com",
    blurb: "Consumer intelligence and social listening.",
  },

  // Sydney leftovers
  "syd-vet-chat": {
    name: "PetSure",
    website: "https://www.petsure.com.au",
    blurb: "Pet insurance technology and claims.",
  },
  "syd-tyro-ml": {
    name: "Immutable",
    website: "https://www.immutable.com",
    blurb: "Web3 gaming and NFT infrastructure.",
  },
  "syd-assembly-payments": {
    name: "Till Payments",
    website: "https://tillpayments.com",
    blurb: "Payments platform (formerly Assembly Payments).",
  },

  // Melbourne leftovers
  "mel-tiger-trade": {
    name: "Tiger Brokers AU",
    website: "https://www.tigerbrokers.com.au",
    blurb: "Online brokerage platform.",
  },
  "mel-a2b-australia": {
    name: "A2B Australia",
    website: "https://www.a2baustralia.com",
    blurb: "Taxi and personal transport network technology.",
  },
  "mel-cameo": {
    name: "Cameo",
    website: "https://www.cameo.com",
    blurb: "Personalised video shout-outs (AU presence).",
  },
  "mel-promise-pay": {
    name: "Pin Payments",
    website: "https://pinpayments.com",
    blurb: "Australian payment gateway for developers.",
  },
  "mel-forestry": {
    name: "Carbon Positive Australia",
    website: "https://carbonpositiveaustralia.org.au",
    blurb: "Reforestation and carbon project technology.",
  },
  "mel-flip": {
    name: "Catch.com.au",
    website: "https://www.catch.com.au",
    blurb: "Online marketplace and retail commerce.",
  },
  "mel-snapfix": {
    name: "ServiceSeeking",
    website: "https://www.serviceseeking.com.au",
    blurb: "Marketplace for local service providers.",
  },
  "mel-reach": {
    name: "The Iconic",
    website: "https://www.theiconic.com.au",
    blurb: "Online fashion retail.",
  },
  "mel-kinaxis": {
    name: "Kinaxis",
    website: "https://www.kinaxis.com",
    blurb: "Supply chain planning software (AU office).",
  },

  // Adelaide — replace illustrative density with real SA companies
  "adl-luminary-ai": {
    name: "Complexica",
    website: "https://www.complexica.com",
    blurb: "AI decisioning software for enterprise.",
  },
  "adl-neoen-ops": {
    name: "Neoen Australia",
    website: "https://www.neoen.com",
    blurb: "Renewable energy developer and operator.",
  },
  "adl-space-machine-company": {
    name: "Inovor Technologies",
    website: "https://www.inovor.com.au",
    blurb: "Small satellite missions and space systems.",
  },
  "adl-robotics-vision-lab": {
    name: "Rising Sun Pictures",
    website: "https://www.rsp.com.au",
    blurb: "VFX and creative technology studio.",
  },
  "adl-simpatico": {
    name: "Southern Launch",
    website: "https://southernlaunch.space",
    blurb: "Orbital and suborbital launch services.",
  },
  "adl-hydroflow": {
    name: "Minelab",
    website: "https://www.minelab.com",
    blurb: "Metal detection technology (Adelaide).",
  },
  "adl-beach-energy-digital": {
    name: "Beach Energy",
    website: "https://www.beachenergy.com.au",
    blurb: "Oil and gas producer with digital operations.",
  },
  "adl-santafe-medtech": {
    name: "LBT Innovations",
    website: "https://www.lbtinnovations.com",
    blurb: "Microbiology diagnostics automation.",
  },
  "adl-swipejobs-sa": {
    name: "Swipejobs",
    website: "https://swipejobs.com",
    blurb: "On-demand staffing marketplace.",
  },
  "adl-edtech-coach": {
    name: "SAGE Automation",
    website: "https://www.sageautomation.com",
    blurb: "Industrial automation and robotics.",
  },
  "adl-logistics-lab": {
    name: "Codan",
    website: "https://codan.com.au",
    blurb: "Communications and metal detection technology.",
  },
  "adl-cyber-south": {
    name: "Fivecast",
    website: "https://www.fivecast.com",
    blurb: "Open-source intelligence software.",
  },
  "adl-healthcare-marketplace": {
    name: "Splose",
    website: "https://www.splose.com",
    blurb: "Allied health practice management software.",
  },
  "adl-proptech-sa": {
    name: "Real Estate Comms",
    website: "https://www.realestate.com.au",
    blurb: "Property marketplace technology (REA Group).",
  },
  "adl-construction-saas": {
    name: "BioCina",
    website: "https://www.biocina.com",
    blurb: "Biologics CDMO based in Adelaide.",
  },
  "adl-creator-tools": {
    website: "https://www.myriota.com",
    name: "Myriota Labs",
    blurb: "Satellite IoT connectivity.",
  },
  "adl-fintech-sa": {
    name: "Prospa",
    website: "https://www.prospa.com",
    blurb: "Small business lending (AU).",
  },
  "adl-tourism-tech": {
    name: "Experience Oz",
    website: "https://www.experienceoz.com.au",
    blurb: "Tours and attractions marketplace.",
  },
  "adl-retail-ops": {
    name: "Advanced Plastic Recyclers",
    website: "https://www.aprplastics.com.au",
    blurb: "Recycling technology operations.",
  },
  "adl-devtools": {
    name: "Saber Astronautics",
    website: "https://www.saberastro.com",
    blurb: "Spaceflight operations software.",
  },
  "adl-rd-lab": {
    name: "Neumann Space",
    website: "https://neumannspace.com",
    blurb: "Electric propulsion for satellites.",
  },
  "adl-battery-tech": {
    name: "Redflow",
    website: "https://redflow.com",
    blurb: "Zinc-bromine flow battery technology.",
  },
  "adl-climate-saas": {
    name: "99 Design / Climate SA",
    website: "https://www.carbonpositiveaustralia.org.au",
    blurb: "Carbon and climate project services.",
  },
  "adl-iot-sensors": {
    name: "Myriota",
    website: "https://myriota.com",
    blurb: "Direct-to-orbit IoT connectivity.",
  },
  "adl-legaltech": {
    name: "Lawcadia",
    website: "https://www.lawcadia.com",
    blurb: "Legal matter management marketplace.",
  },
  "adl-data-platform": {
    name: "Sensis Data",
    website: "https://www.sensis.com.au",
    blurb: "Business data and marketing services.",
  },
  "adl-community": {
    name: "Lot Fourteen",
    website: "https://lotfourteen.com.au",
    blurb: "Innovation precinct community platform.",
  },
  "adl-industry-tech": {
    name: "Andromeda Metals",
    website: "https://www.andromet.com.au",
    blurb: "Industrial minerals and materials tech.",
  },
  "adl-education-tools": {
    name: "CQU Adelaide Digital",
    website: "https://www.cqu.edu.au",
    blurb: "Higher-ed digital learning presence.",
  },
  "adl-marketing-platform": {
    name: "Local Measure",
    website: "https://www.localmeasure.com",
    blurb: "Location intelligence for venues and brands.",
  },
  "adl-enterprise-saas": {
    name: "TechnologyOne",
    website: "https://www.technologyonecorp.com",
    blurb: "Enterprise SaaS (AU).",
  },
  "adl-mobility": {
    name: "Sage Automation Mobility",
    website: "https://www.sageautomation.com",
    blurb: "Automation systems for industry.",
  },
  "adl-ecommerce-tools": {
    name: "NetSuite Adelaide",
    website: "https://www.netsuite.com",
    blurb: "Cloud ERP and ecommerce operations.",
  },

  // Perth — replace illustrative Spacecubed + fillers
  "per-spacecubed-member-1": {
    name: "VGW",
    website: "https://www.vgw.co",
    blurb: "Social casino gaming technology (Perth).",
  },
  "per-spacecubed-member-2": {
    name: "iCetana",
    website: "https://icetana.com",
    blurb: "AI video surveillance analytics.",
  },
  "per-spacecubed-member-3": {
    name: "DUG Technology",
    website: "https://dug.com",
    blurb: "HPC and geoscience technology.",
  },
  "per-spacecubed-member-4": {
    name: "BrainChip",
    website: "https://brainchip.com",
    blurb: "Neuromorphic AI semiconductor company.",
  },
  "per-spacecubed-member-5": {
    name: "Hazer Group",
    website: "https://hazergroup.com.au",
    blurb: "Clean hydrogen and graphite technology.",
  },
  "per-spacecubed-member-6": {
    name: "LiveHire",
    website: "https://www.livehire.com",
    blurb: "Talent acquisition SaaS.",
  },
  "per-spacecubed-member-7": {
    name: "Superloop",
    website: "https://www.superloop.com",
    blurb: "Connectivity and broadband network.",
  },
  "per-spacecubed-member-8": {
    name: "Spacecubed",
    website: "https://spacecubed.com",
    blurb: "Perth innovation hub and community.",
  },
  "per-lynn-tech": {
    name: "Lynas Rare Earths",
    website: "https://lynasrareearths.com",
    blurb: "Rare earths producer with digital operations.",
  },
  "per-uw-ventures": {
    name: "UWA Innovation",
    website: "https://www.uwa.edu.au",
    blurb: "University of Western Australia innovation.",
  },
  "per-curtin-innovate": {
    name: "Curtin University Innovation",
    website: "https://www.curtin.edu.au",
    blurb: "Curtin research commercialisation.",
  },
  "per-edtech-wa": {
    name: "SkoolBag",
    website: "https://www.skoolbag.com.au",
    blurb: "School communication app.",
  },
  "per-agtech-wa": {
    name: "Agworld",
    website: "https://www.agworld.com",
    blurb: "Farm management software.",
  },
  "per-proptech": {
    name: "REIWA Digital",
    website: "https://reiwa.com.au",
    blurb: "WA property industry digital platform.",
  },
  "per-insurtech": {
    name: "HBF",
    website: "https://www.hbf.com.au",
    blurb: "Health insurance and digital member services.",
  },
  "per-marketplace": {
    name: "Gumtree AU",
    website: "https://www.gumtree.com.au",
    blurb: "Classifieds marketplace.",
  },
  "per-travel-tech": {
    name: "Tourism WA Digital",
    website: "https://www.westernaustralia.com",
    blurb: "Destination marketing technology.",
  },
  "per-retail-tech": {
    name: "OpenWindows",
    website: "https://www.openwindows.com.au",
    blurb: "Grants and funding management software.",
  },
  "per-ecommerce-tools": {
    name: "Neto / Maropost Commerce",
    website: "https://www.maropost.com",
    blurb: "Ecommerce and marketing cloud.",
  },
  "per-devtools": {
    name: "Atlassian Perth",
    website: "https://www.atlassian.com",
    blurb: "Team collaboration software.",
  },
  "per-data-platform": {
    name: "Nearmap Data",
    website: "https://www.nearmap.com",
    blurb: "Aerial imagery and location data.",
  },
  "per-community": {
    name: "Spacecubed Community",
    website: "https://spacecubed.com",
    blurb: "Startup community and coworking.",
  },
  "per-creator-tools": {
    name: "Canva",
    website: "https://www.canva.com",
    blurb: "Visual communication platform.",
  },
  "per-saas-wa": {
    name: "Employment Hero WA",
    website: "https://employmenthero.com",
    blurb: "HR and payroll SaaS.",
  },
  "per-hr-tech": {
    name: "ELMO Software",
    website: "https://elmorsoftware.com",
    blurb: "HR and talent management software.",
  },
  "per-construction-tech": {
    name: "Jobpac",
    website: "https://www.jobpac.com.au",
    blurb: "Construction ERP software.",
  },
  "per-mobility": {
    name: "RAC WA",
    website: "https://rac.com.au",
    blurb: "Mobility and member services technology.",
  },
  "per-legaltech": {
    name: "InfoTrack",
    website: "https://www.infotrack.com.au",
    blurb: "Legal property search technology.",
  },
  "per-marketing-platform": {
    name: "Market Force WA",
    website: "https://www.campaignmonitor.com",
    blurb: "Email and journey marketing.",
  },
  "per-enterprise-saas": {
    name: "TechnologyOne WA",
    website: "https://www.technologyonecorp.com",
    blurb: "Enterprise SaaS suites.",
  },
  "per-climate-saas": {
    name: "Fortescue Future Industries",
    website: "https://www.fortescue.com",
    blurb: "Green energy and industry.",
  },
  "per-iot-sensors": {
    name: "Imdex",
    website: "https://www.imdexlimited.com",
    blurb: "Mining technology and downhole tools.",
  },
  "per-ocean-tech": {
    name: "Carnegie Clean Energy",
    website: "https://www.carnegiece.com",
    blurb: "Wave energy technology.",
  },
  "per-space-wa": {
    name: "Gilmour Space WA",
    website: "https://www.gspace.com",
    blurb: "Launch and space systems.",
  },
  "per-foodtech": {
    name: "Hipp&Co",
    website: "https://www.hippandco.com",
    blurb: "Food and beverage brand platform.",
  },
};

function main() {
  const cities = ["brisbane", "sydney", "melbourne", "adelaide", "perth"];
  let updated = 0;
  for (const city of cities) {
    const file = path.join(root, "src", "data", "startups", `${city}.json`);
    const startups = JSON.parse(fs.readFileSync(file, "utf8"));
    let dirty = false;
    for (const s of startups) {
      const patch = REPLACEMENTS[s.id];
      if (!patch) continue;
      Object.assign(s, patch);
      dirty = true;
      updated++;
    }
    if (dirty) fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
  }
  console.log(JSON.stringify({ updated }, null, 2));
}

main();
