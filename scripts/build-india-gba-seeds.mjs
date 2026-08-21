/**
 * Writes curated seed JSON for Indian metros and Greater Bay Area cities.
 * Usage: node scripts/build-india-gba-seeds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const startupsDir = path.join(dataDir, "startups");

const BUILDINGS = {
  "blr-koramangala": {
    name: "Koramangala Hub",
    city: "bangalore",
    lat: 12.9352,
    lng: 77.6245,
    address: "Koramangala, Bengaluru",
  },
  "mum-bkc": {
    name: "Bandra Kurla Complex",
    city: "mumbai",
    lat: 19.0668,
    lng: 72.8697,
    address: "Bandra Kurla Complex, Mumbai",
  },
  "del-cyberhub": {
    name: "Cyber Hub",
    city: "delhi-ncr",
    lat: 28.495,
    lng: 77.089,
    address: "Cyber Hub, DLF Cyber City, Gurugram",
  },
  "hyd-hitech": {
    name: "HITEC City",
    city: "hyderabad",
    lat: 17.4435,
    lng: 78.3772,
    address: "HITEC City, Hyderabad",
  },
  "chn-omr": {
    name: "OMR / Tidel Park",
    city: "chennai",
    lat: 12.989,
    lng: 80.248,
    address: "OMR, Chennai",
  },
  "pun-hinjewadi": {
    name: "Hinjewadi",
    city: "pune",
    lat: 18.5912,
    lng: 73.7389,
    address: "Hinjewadi Phase 1, Pune",
  },
  "hk-cyberport": {
    name: "Cyberport",
    city: "hong-kong",
    lat: 22.261,
    lng: 114.13,
    address: "Cyberport, Hong Kong",
  },
  "sz-nanshan": {
    name: "Nanshan / Science Park",
    city: "shenzhen",
    lat: 22.54,
    lng: 113.94,
    address: "Nanshan District, Shenzhen",
  },
  "gz-pazhou": {
    name: "Pazhou",
    city: "guangzhou",
    lat: 23.098,
    lng: 113.37,
    address: "Pazhou, Guangzhou",
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

/** rec: [id, name, website, sector, address, lat, lng, blurb, fundingStage, buildingId?] */
function row(city, rec, hubIndex) {
  const [id, name, website, sector, address, lat, lng, blurb, fundingStage, buildingId] =
    rec;
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
    fundingStage,
    ...(building ? { buildingId, buildingName: building.name } : {}),
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
  fs.writeFileSync(
    path.join(startupsDir, `${city}.json`),
    JSON.stringify(startups, null, 2) + "\n",
  );
  console.log(`${city}: ${startups.length}`);
}

const bangalore = [
  ["blr-flipkart", "Flipkart", "https://www.flipkart.com", "Marketplace", "Embassy Tech Village, Bengaluru", 12.932, 77.695, "India’s leading e-commerce marketplace, founded in Bangalore.", "Public"],
  ["blr-swiggy", "Swiggy", "https://www.swiggy.com", "Logistics", "Bannerghatta Rd, Bengaluru", 12.912, 77.601, "Food delivery and quick commerce unicorn founded in Bangalore.", "Growth", "blr-koramangala"],
  ["blr-razorpay", "Razorpay", "https://razorpay.com", "FinTech", "Koramangala, Bengaluru", 12.9352, 77.6245, "Payments infrastructure for Indian businesses.", "Series D+", "blr-koramangala"],
  ["blr-phonepe", "PhonePe", "https://www.phonepe.com", "FinTech", "Embassy Tech Village, Bengaluru", 12.933, 77.696, "UPI payments and financial services app.", "Growth"],
  ["blr-zerodha", "Zerodha", "https://zerodha.com", "FinTech", "Bellandur, Bengaluru", 12.925, 77.675, "Bootstrapped discount broker that redefined Indian retail investing.", "Bootstrapped"],
  ["blr-freshworks", "Freshworks", "https://www.freshworks.com", "SaaS", "Global Village, Bengaluru", 12.91, 77.52, "Customer engagement SaaS with deep Bangalore roots.", "Public"],
  ["blr-meesho", "Meesho", "https://www.meesho.com", "Marketplace", "Koramangala, Bengaluru", 12.9352, 77.6245, "Social commerce marketplace for India’s reseller economy.", "Series D+", "blr-koramangala"],
  ["blr-cred", "CRED", "https://cred.club", "FinTech", "Koramangala, Bengaluru", 12.9352, 77.6245, "Credit-card rewards and fintech app for affluent Indians.", "Series D+", "blr-koramangala"],
  ["blr-sharechat", "ShareChat", "https://sharechat.com", "Media", "Indiranagar, Bengaluru", 12.9784, 77.6408, "Indian-language social network and Moj short video.", "Growth"],
  ["blr-udaan", "Udaan", "https://udaan.com", "Marketplace", "Bellandur, Bengaluru", 12.927, 77.678, "B2B marketplace for Indian SMEs and kiranas.", "Series D+"],
  ["blr-slice", "slice", "https://www.sliceit.com", "FinTech", "Koramangala, Bengaluru", 12.9352, 77.6245, "Consumer credit and neobanking for young Indians.", "Series C", "blr-koramangala"],
  ["blr-nobroker", "NoBroker", "https://www.nobroker.in", "PropTech", "Indiranagar, Bengaluru", 12.9784, 77.6408, "Broker-free rental and home services marketplace.", "Series D+"],
  ["blr-postman", "Postman", "https://www.postman.com", "SaaS", "Bengaluru", 12.9716, 77.5946, "API platform used by developers worldwide.", "Series D+"],
  ["blr-chargebee", "Chargebee", "https://www.chargebee.com", "SaaS", "Bengaluru", 12.97, 77.6, "Subscription billing infrastructure.", "Growth"],
  ["blr-browserstack", "BrowserStack", "https://www.browserstack.com", "SaaS", "Bengaluru", 12.968, 77.61, "Cross-browser testing platform.", "Series B"],
  ["blr-cultfit", "Cult.fit", "https://www.cult.fit", "Health", "Koramangala, Bengaluru", 12.9352, 77.6245, "Fitness, nutrition, and digital wellness brand.", "Series D+", "blr-koramangala"],
  ["blr-unacademy", "Unacademy", "https://unacademy.com", "EdTech", "Indiranagar, Bengaluru", 12.9784, 77.6408, "Online learning for competitive exams.", "Growth"],
  ["blr-livspace", "Livspace", "https://www.livspace.com", "PropTech", "Domlur, Bengaluru", 12.961, 77.638, "Home interiors marketplace and design platform.", "Series D+"],
  ["blr-hasura", "Hasura", "https://hasura.io", "SaaS", "Bengaluru", 12.971, 77.61, "GraphQL and data-access platform for developers.", "Series C"],
  ["blr-yellowai", "Yellow.ai", "https://yellow.ai", "AI", "Bengaluru", 12.97, 77.6, "Conversational AI platform for enterprises.", "Series C"],
  ["blr-ola", "Ola", "https://www.olacabs.com", "Mobility", "Bengaluru", 12.93, 77.62, "Ride-hailing and EV mobility group founded in Bangalore.", "Growth"],
  ["blr-ola-electric", "Ola Electric", "https://olaelectric.com", "Climate", "Bengaluru", 12.93, 77.63, "EV two-wheeler manufacturer.", "Public"],
  ["blr-zepto", "Zepto", "https://www.zeptonow.com", "Logistics", "Koramangala, Bengaluru", 12.9352, 77.6245, "Quick-commerce grocery with a large Bangalore footprint.", "Series D+", "blr-koramangala"],
  ["blr-jupiter", "Jupiter", "https://jupiter.money", "FinTech", "Bengaluru", 12.97, 77.6, "Digital banking and money app.", "Series C"],
  ["blr-open", "Open", "https://open.money", "FinTech", "Bengaluru", 12.97, 77.61, "Banking and payments OS for SMEs.", "Series D+"],
  ["blr-khatabook", "Khatabook", "https://khatabook.com", "FinTech", "Bengaluru", 12.97, 77.6, "Digital ledger for Indian merchants.", "Series C"],
  ["blr-apna", "Apna", "https://apna.co", "Marketplace", "Bengaluru", 12.97, 77.6, "Jobs marketplace for blue- and grey-collar India.", "Series C"],
  ["blr-cashfree", "Cashfree", "https://www.cashfree.com", "FinTech", "Bengaluru", 12.97, 77.6, "Payments and payouts API for Indian businesses.", "Series C"],
  ["blr-niramai", "Niramai", "https://www.niramai.com", "Health", "Bengaluru", 12.97, 77.6, "AI breast-cancer screening using thermal imaging.", "Series A"],
  ["blr-synapsica", "Synapsica", "https://synapsica.com", "Health", "Bengaluru", 12.97, 77.6, "AI radiology diagnostics.", "Series A"],
  ["blr-pratilipi", "Pratilipi", "https://www.pratilipi.com", "Media", "Koramangala, Bengaluru", 12.9352, 77.6245, "Indian-language storytelling platform.", "Series C", "blr-koramangala"],
  ["blr-instamojo", "Instamojo", "https://www.instamojo.com", "FinTech", "Koramangala, Bengaluru", 12.9352, 77.6245, "Payments and storefront tools for SMEs.", "Series B", "blr-koramangala"],
  ["blr-navi", "Navi", "https://navi.com", "FinTech", "Bengaluru", 12.96, 77.64, "Digital lending and insurance group.", "Growth"],
  ["blr-fractal", "Fractal Analytics", "https://fractal.ai", "AI", "Bengaluru", 12.968, 77.6, "AI and analytics services unicorn.", "Series D+"],
  ["blr-myntra", "Myntra", "https://www.myntra.com", "Marketplace", "Bengaluru", 12.97, 77.6, "Fashion e-commerce in the Flipkart group.", "Public"],
  ["blr-dunzo", "Dunzo", "https://www.dunzo.com", "Logistics", "Koramangala, Bengaluru", 12.9352, 77.6245, "Hyperlocal delivery pioneer from Bangalore.", "Series D+", "blr-koramangala"],
  ["blr-bounce", "Bounce", "https://www.bounceshare.com", "Mobility", "Bengaluru", 12.935, 77.62, "Shared mobility and EV scooter network.", "Series D+"],
  ["blr-cleartrip", "Cleartrip", "https://www.cleartrip.com", "Travel", "Bengaluru", 12.972, 77.595, "Online travel agency with deep India inventory.", "Growth"],
  ["blr-byjus", "BYJU'S", "https://byjus.com", "EdTech", "Bengaluru", 12.9125, 77.6015, "Edtech platform that scaled online learning from Bangalore.", "Growth"],
  ["blr-licious", "Licious", "https://www.licious.in", "Consumer", "Bengaluru", 12.97, 77.6, "Fresh meat and seafood D2C brand.", "Series D+"],
];

const mumbai = [
  ["mum-paytm", "Paytm", "https://paytm.com", "FinTech", "BKC / Noida presence; Mumbai markets", 19.0668, 72.8697, "Payments and financial services giant with a major Mumbai market presence.", "Public", "mum-bkc"],
  ["mum-dream11", "Dream11", "https://www.dream11.com", "Media", "Lower Parel, Mumbai", 19.0, 72.83, "Fantasy sports unicorn founded in Mumbai.", "Series D+"],
  ["mum-policybazaar", "Policybazaar", "https://www.policybazaar.com", "InsurTech", "Mumbai / Gurugram", 19.06, 72.87, "Insurance marketplace with strong Mumbai distribution.", "Public"],
  ["mum-nykaa", "Nykaa", "https://www.nykaa.com", "Marketplace", "Mumbai", 19.12, 72.85, "Beauty and lifestyle commerce unicorn, public.", "Public"],
  ["mum-groww", "Groww", "https://groww.in", "FinTech", "Mumbai / Bengaluru", 19.0668, 72.8697, "Investment app for stocks and mutual funds.", "Series D+", "mum-bkc"],
  ["mum-zepto", "Zepto", "https://www.zeptonow.com", "Logistics", "Andheri / Mumbai HQ", 19.12, 72.85, "10-minute grocery delivery founded in Mumbai.", "Series D+"],
  ["mum-lenskart", "Lenskart", "https://www.lenskart.com", "Consumer", "Mumbai / Gurugram", 19.07, 72.87, "Eyewear D2C and retail network.", "Series D+"],
  ["mum-carwale", "CarWale", "https://www.carwale.com", "Marketplace", "Mumbai", 19.1, 72.83, "Auto classifieds and research platform.", "Growth"],
  ["mum-bookmyshow", "BookMyShow", "https://in.bookmyshow.com", "Media", "Mumbai", 19.06, 72.84, "Entertainment ticketing platform.", "Growth"],
  ["mum-pharmeasy", "PharmEasy", "https://pharmeasy.in", "Health", "Mumbai", 19.12, 72.87, "Online pharmacy and diagnostics.", "Series D+"],
  ["mum-fractal", "Fractal Analytics", "https://fractal.ai", "AI", "Mumbai", 19.07, 72.87, "AI analytics unicorn with Mumbai HQ roots.", "Series D+", "mum-bkc"],
  ["mum-delhivery", "Delhivery", "https://www.delhivery.com", "Logistics", "Mumbai hub", 19.08, 72.88, "Logistics network with major Mumbai sortation.", "Public"],
  ["mum-easebuzz", "Easebuzz", "https://easebuzz.in", "FinTech", "Pune / Mumbai corridor", 19.07, 72.87, "Payments for education and SMEs.", "Series B"],
  ["mum-smallcase", "smallcase", "https://www.smallcase.com", "FinTech", "Mumbai", 19.06, 72.87, "Thematic investing platform.", "Series C"],
  ["mum-upstox", "Upstox", "https://upstox.com", "FinTech", "Mumbai", 19.0668, 72.8697, "Discount brokerage and trading app.", "Series C", "mum-bkc"],
  ["mum-angelone", "Angel One", "https://www.angelone.in", "FinTech", "Mumbai", 19.06, 72.86, "Listed brokerage with a large digital franchise.", "Public"],
  ["mum-5paisa", "5paisa", "https://www.5paisa.com", "FinTech", "Mumbai", 19.05, 72.85, "Digital brokerage for retail traders.", "Public"],
  ["mum-tata-digital", "Tata Digital", "https://www.tatadigital.com", "Marketplace", "Mumbai", 18.93, 72.83, "Tata Neu superapp and digital commerce group.", "Growth"],
  ["mum-bigbasket", "bigbasket", "https://www.bigbasket.com", "Logistics", "Mumbai", 19.1, 72.88, "Online grocery pioneer, Tata group.", "Growth"],
  ["mum-urban-company", "Urban Company", "https://www.urbancompany.com", "Marketplace", "Mumbai ops", 19.12, 72.85, "Home services marketplace with dense Mumbai supply.", "Series D+"],
  ["mum-meesho-mum", "Meesho Mumbai", "https://www.meesho.com", "Marketplace", "Mumbai", 19.07, 72.87, "Social commerce seller and category ops.", "Series D+"],
  ["mum-razorpay-mum", "Razorpay Mumbai", "https://razorpay.com", "FinTech", "BKC, Mumbai", 19.0668, 72.8697, "Payments enterprise coverage for Western India.", "Series D+", "mum-bkc"],
  ["mum-swiggy-mum", "Swiggy Mumbai", "https://www.swiggy.com", "Logistics", "Mumbai", 19.08, 72.84, "Food and Instamart densest city ops.", "Growth"],
  ["mum-zomato-mum", "Zomato Mumbai", "https://www.zomato.com", "Logistics", "Mumbai", 19.09, 72.85, "Food delivery and dining discovery.", "Public"],
  ["mum-jio", "Jio Platforms", "https://www.jio.com", "Telecom", "Mumbai", 19.06, 72.87, "Digital services and connectivity arm of Reliance.", "Growth"],
  ["mum-sharekhan", "Sharekhan", "https://www.sharekhan.com", "FinTech", "Mumbai", 19.05, 72.84, "Full-service brokerage going digital.", "Growth"],
  ["mum-goodera", "Goodera", "https://www.goodera.com", "SaaS", "Mumbai", 19.07, 72.87, "Corporate volunteering and ESG platform.", "Series A"],
  ["mum-setu", "Setu", "https://setu.co", "FinTech", "Mumbai / Bengaluru", 19.0668, 72.8697, "Account aggregator and open banking APIs.", "Series B", "mum-bkc"],
  ["mum-cashfree-mum", "Cashfree Mumbai", "https://www.cashfree.com", "FinTech", "Mumbai", 19.07, 72.87, "Payments enterprise coverage.", "Series C"],
  ["mum-incred", "InCred", "https://www.incred.com", "FinTech", "Mumbai", 19.06, 72.86, "Digital lending and wealth.", "Series D+"],
  ["mum-furlenco", "Furlenco", "https://www.furlenco.com", "Consumer", "Mumbai / Bengaluru", 19.1, 72.85, "Furniture subscription and rental.", "Series C"],
  ["mum-housing", "Housing.com", "https://housing.com", "PropTech", "Mumbai", 19.07, 72.87, "Property search portal.", "Growth"],
  ["mum-magicbricks", "Magicbricks", "https://www.magicbricks.com", "PropTech", "Mumbai", 19.06, 72.86, "Real-estate classifieds.", "Growth"],
  ["mum-acko", "ACKO", "https://www.acko.com", "InsurTech", "Mumbai / Bengaluru", 19.07, 72.87, "Digital insurer with Mumbai presence.", "Series D+"],
  ["mum-pine-labs", "Pine Labs", "https://www.pinelabs.com", "FinTech", "Mumbai", 19.0668, 72.8697, "Merchant payments and POS network.", "Series D+", "mum-bkc"],
  ["mum-mobikwik", "MobiKwik", "https://www.mobikwik.com", "FinTech", "Mumbai ops", 19.08, 72.87, "Wallet and BNPL for Indian consumers.", "Public"],
  ["mum-bankbazaar", "BankBazaar", "https://www.bankbazaar.com", "FinTech", "Mumbai", 19.07, 72.86, "Credit and loan marketplace.", "Series D+"],
  ["mum-clear", "Clear", "https://cleartax.in", "FinTech", "Mumbai / Bengaluru", 19.07, 72.87, "Tax filing and compliance software.", "Series C"],
  ["mum-ply", "PLY", "https://www.ply.me", "FinTech", "Mumbai", 19.06, 72.86, "SME credit and embedded finance.", "Series A"],
  ["mum-liquiloans", "LiquiLoans", "https://www.liquiloans.com", "FinTech", "Mumbai", 19.07, 72.87, "P2P and fixed-income marketplace.", "Series C"],
];

const delhiNcr = [
  ["del-zomato", "Zomato", "https://www.zomato.com", "Logistics", "Gurugram", 28.4595, 77.0266, "Food delivery and dining discovery unicorn, founded in Delhi-NCR.", "Public", "del-cyberhub"],
  ["del-paytm", "Paytm", "https://paytm.com", "FinTech", "Noida / Gurugram", 28.5355, 77.391, "Payments and financial services HQ corridor in NCR.", "Public"],
  ["del-policybazaar", "Policybazaar", "https://www.policybazaar.com", "InsurTech", "Gurugram", 28.495, 77.089, "Insurance marketplace headquartered in Gurugram.", "Public", "del-cyberhub"],
  ["del-makemytrip", "MakeMyTrip", "https://www.makemytrip.com", "Travel", "Gurugram", 28.495, 77.089, "Online travel pioneer of India.", "Public", "del-cyberhub"],
  ["del-infoedge", "Info Edge", "https://www.infoedge.in", "Marketplace", "Noida", 28.535, 77.391, "Parent of Naukri, 99acres, and Jeevansathi.", "Public"],
  ["del-naukri", "Naukri", "https://www.naukri.com", "Marketplace", "Noida", 28.535, 77.391, "Jobs marketplace that defined Indian hiring online.", "Public"],
  ["del-99acres", "99acres", "https://www.99acres.com", "PropTech", "Noida", 28.535, 77.391, "Property classifieds from Info Edge.", "Public"],
  ["del-snapdeal", "Snapdeal", "https://www.snapdeal.com", "Marketplace", "Gurugram", 28.45, 77.05, "E-commerce marketplace founded in Delhi-NCR.", "Series D+"],
  ["del-shopclues", "ShopClues", "https://www.shopclues.com", "Marketplace", "Gurugram", 28.46, 77.05, "Value e-commerce marketplace.", "Series D+"],
  ["del-cardekho", "CarDekho", "https://www.cardekho.com", "Marketplace", "Gurugram", 28.495, 77.089, "Auto research and transactions platform.", "Series D+", "del-cyberhub"],
  ["del-rategain", "RateGain", "https://www.rategain.com", "SaaS", "Noida", 28.54, 77.39, "Hospitality SaaS and distribution tech.", "Public"],
  ["del-innovaccer", "Innovaccer", "https://innovaccer.com", "Health", "Noida", 28.54, 77.39, "Healthcare data platform unicorn.", "Series D+"],
  ["del-healthifyme", "HealthifyMe", "https://www.healthifyme.com", "Health", "Gurugram / Bengaluru", 28.49, 77.09, "AI nutrition and fitness coach.", "Series C"],
  ["del-unacademy-ncr", "Unacademy NCR", "https://unacademy.com", "EdTech", "Delhi", 28.61, 77.21, "Exam prep and educator marketplace presence.", "Growth"],
  ["del-vedantu", "Vedantu", "https://www.vedantu.com", "EdTech", "Gurugram / Bengaluru", 28.49, 77.08, "Live online tutoring platform.", "Series D+"],
  ["del-lenskart", "Lenskart", "https://www.lenskart.com", "Consumer", "Gurugram", 28.495, 77.089, "Eyewear D2C with NCR retail density.", "Series D+", "del-cyberhub"],
  ["del-urbancompany", "Urban Company", "https://www.urbancompany.com", "Marketplace", "Gurugram", 28.495, 77.089, "Home services marketplace founded in NCR.", "Series D+", "del-cyberhub"],
  ["del-spinny", "Spinny", "https://www.spinny.com", "Marketplace", "Gurugram", 28.47, 77.07, "Used-car marketplace.", "Series D+"],
  ["del-cars24", "Cars24", "https://www.cars24.com", "Marketplace", "Gurugram", 28.48, 77.08, "Used-car buying and selling platform.", "Series D+"],
  ["del-acko", "ACKO", "https://www.acko.com", "InsurTech", "Gurugram / Bengaluru", 28.49, 77.09, "Digital insurance.", "Series D+"],
  ["del-ofbusiness", "OfBusiness", "https://www.ofbusiness.com", "Marketplace", "Gurugram", 28.495, 77.089, "B2B commerce and credit for SMEs.", "Series D+", "del-cyberhub"],
  ["del-bizongo", "Bizongo", "https://www.bizongo.com", "Marketplace", "Gurugram", 28.49, 77.08, "Packaging and manufacturing marketplace.", "Series D+"],
  ["del-jumbotail", "Jumbotail", "https://jumbotail.com", "Marketplace", "Delhi ops / Bengaluru", 28.55, 77.25, "Food and grocery B2B commerce.", "Series C"],
  ["del-shiprocket", "Shiprocket", "https://www.shiprocket.in", "Logistics", "Delhi / Gurugram", 28.5, 77.09, "E-commerce shipping aggregator.", "Series D+"],
  ["del-shadowfax", "Shadowfax", "https://www.shadowfax.in", "Logistics", "Gurugram / Bengaluru", 28.49, 77.08, "Last-mile logistics network.", "Series D+"],
  ["del-blackbuck", "BlackBuck", "https://www.blackbuck.com", "Logistics", "Gurugram / Bengaluru", 28.49, 77.09, "Truck freight marketplace.", "Public"],
  ["del-ninjacart", "Ninjacart", "https://ninjacart.in", "AgriTech", "Delhi ops / Bengaluru", 28.55, 77.2, "Fresh produce supply-chain platform.", "Series C"],
  ["del-dealshare", "DealShare", "https://www.dealshare.in", "Marketplace", "Gurugram / Jaipur", 28.48, 77.07, "Value social commerce for Bharat.", "Series D+"],
  ["del-sharechat-ncr", "ShareChat NCR", "https://sharechat.com", "Media", "Gurugram", 28.49, 77.09, "Indian-language social product presence.", "Growth"],
  ["del-glance", "Glance", "https://glance.com", "Media", "Gurugram", 28.495, 77.089, "Lockscreen content platform from InMobi.", "Growth", "del-cyberhub"],
  ["del-hike", "Hike", "https://hike.in", "Media", "Delhi", 28.61, 77.21, "Messaging and Rush gaming brand.", "Series D+"],
  ["del-ixigo", "ixigo", "https://www.ixigo.com", "Travel", "Gurugram", 28.49, 77.08, "Travel search and booking app.", "Public"],
  ["del-easemytrip", "EaseMyTrip", "https://www.easemytrip.com", "Travel", "Delhi", 28.63, 77.22, "Listed online travel agency.", "Public"],
  ["del-yatra", "Yatra", "https://www.yatra.com", "Travel", "Gurugram", 28.49, 77.09, "Online travel agency.", "Public"],
  ["del-magicpin", "magicpin", "https://magicpin.in", "Marketplace", "Gurugram", 28.49, 77.08, "Hyperlocal discovery and cashback.", "Series D+"],
  ["del-1mg", "1mg", "https://www.1mg.com", "Health", "Gurugram", 28.495, 77.089, "Online pharmacy and health content.", "Growth", "del-cyberhub"],
  ["del-practo", "Practo", "https://www.practo.com", "Health", "Delhi / Bengaluru", 28.55, 77.2, "Doctor discovery and health records.", "Series D+"],
  ["del-doconline", "DocOnline", "https://www.doconline.com", "Health", "Gurugram", 28.49, 77.09, "Telemedicine for enterprises.", "Series A"],
  ["del-bharatpe", "BharatPe", "https://bharatpe.com", "FinTech", "Delhi", 28.61, 77.21, "Merchant UPI and lending for kiranas.", "Series D+"],
  ["del-jupiter-ncr", "Jupiter NCR", "https://jupiter.money", "FinTech", "Gurugram", 28.49, 77.09, "Digital banking presence in NCR.", "Series C"],
];

const pune = [
  ["pun-persistent", "Persistent Systems", "https://www.persistent.com", "Enterprise", "Pune", 18.52, 73.86, "Listed digital engineering company based in Pune.", "Public"],
  ["pun-kpit", "KPIT", "https://www.kpit.com", "Enterprise", "Hinjewadi, Pune", 18.5912, 73.7389, "Automotive software and EV tech.", "Public", "pun-hinjewadi"],
  ["pun-quickheal", "Quick Heal", "https://www.quickheal.com", "SaaS", "Pune", 18.55, 73.82, "Cybersecurity products company.", "Public"],
  ["pun-birlasoft", "Birlasoft", "https://www.birlasoft.com", "Enterprise", "Pune", 18.53, 73.85, "Enterprise digital transformation.", "Public"],
  ["pun-techmahindra", "Tech Mahindra", "https://www.techmahindra.com", "Enterprise", "Pune / Hinjewadi", 18.5912, 73.7389, "IT services with a large Pune campus.", "Public", "pun-hinjewadi"],
  ["pun-infosys-pune", "Infosys Pune", "https://www.infosys.com", "Enterprise", "Hinjewadi, Pune", 18.5912, 73.7389, "Major Infosys delivery centre.", "Public", "pun-hinjewadi"],
  ["pun-wipro-pune", "Wipro Pune", "https://www.wipro.com", "Enterprise", "Hinjewadi, Pune", 18.59, 73.74, "IT services campus.", "Public", "pun-hinjewadi"],
  ["pun-cognizant-pune", "Cognizant Pune", "https://www.cognizant.com", "Enterprise", "Hinjewadi, Pune", 18.592, 73.74, "Digital engineering campus.", "Public", "pun-hinjewadi"],
  ["pun-mindtickle", "Mindtickle", "https://www.mindtickle.com", "SaaS", "Pune / US", 18.52, 73.86, "Sales readiness SaaS founded with Pune roots.", "Series D+"],
  ["pun-breatheres", "BreathEasy / local healthtech", "https://www.healthifyme.com", "Health", "Pune", 18.52, 73.85, "Health and wellness product teams in Pune.", "Series C"],
  ["pun-firstcry", "FirstCry", "https://www.firstcry.com", "Marketplace", "Pune", 18.56, 73.81, "Parenting and kids commerce unicorn.", "Series D+"],
  ["pun-elasticrun", "ElasticRun", "https://elasticrun.com", "Logistics", "Pune", 18.55, 73.8, "Rural commerce and logistics network.", "Series D+"],
  ["pun-budli", "Budli", "https://www.budli.in", "Marketplace", "Pune", 18.52, 73.85, "Used electronics marketplace.", "Series A"],
  ["pun-mhcv", "Ola Electric Pune", "https://olaelectric.com", "Climate", "Pune", 18.55, 73.9, "EV supply-chain and engineering presence.", "Public"],
  ["pun-pubmatic", "PubMatic", "https://pubmatic.com", "MarTech", "Pune / US", 18.52, 73.86, "Adtech SSP with a large Pune engineering base.", "Public"],
  ["pun-gs-lab", "GS Lab", "https://www.gslab.com", "SaaS", "Pune", 18.53, 73.84, "Product engineering studio.", "Bootstrapped"],
  ["pun-josh", "Josh Software", "https://joshsoftware.com", "SaaS", "Pune", 18.52, 73.85, "Ruby and product engineering firm.", "Bootstrapped"],
  ["pun-winzo-pune", "WinZO Pune", "https://www.winzogames.com", "Media", "Pune", 18.52, 73.86, "Gaming product engineering presence.", "Series C"],
  ["pun-capgemini", "Capgemini Pune", "https://www.capgemini.com", "Enterprise", "Hinjewadi, Pune", 18.5912, 73.7389, "Digital services campus.", "Public", "pun-hinjewadi"],
  ["pun-accenture", "Accenture Pune", "https://www.accenture.com", "Enterprise", "Hinjewadi, Pune", 18.59, 73.74, "Technology consulting campus.", "Public", "pun-hinjewadi"],
];

const hyderabad = [
  ["hyd-byjus-hyd", "BYJU'S Hyderabad", "https://byjus.com", "EdTech", "Hyderabad", 17.44, 78.38, "Edtech content and ops hub.", "Growth", "hyd-hitech"],
  ["hyd-msci", "Microsoft Hyderabad", "https://www.microsoft.com", "Enterprise", "Gachibowli, Hyderabad", 17.44, 78.35, "One of Microsoft’s largest campuses outside the US.", "Public"],
  ["hyd-google", "Google Hyderabad", "https://www.google.com", "Enterprise", "Gachibowli, Hyderabad", 17.44, 78.36, "Major Google engineering and product campus.", "Public"],
  ["hyd-amazon", "Amazon Hyderabad", "https://www.amazon.in", "Marketplace", "Hyderabad", 17.43, 78.38, "Amazon development centre and retail ops.", "Public", "hyd-hitech"],
  ["hyd-facebook", "Meta Hyderabad", "https://www.meta.com", "Media", "Hyderabad", 17.44, 78.38, "Meta engineering campus.", "Public", "hyd-hitech"],
  ["hyd-flipkart-hyd", "Flipkart Hyderabad", "https://www.flipkart.com", "Marketplace", "Hyderabad", 17.44, 78.37, "E-commerce engineering and category teams.", "Public", "hyd-hitech"],
  ["hyd-swiggy-hyd", "Swiggy Hyderabad", "https://www.swiggy.com", "Logistics", "Hyderabad", 17.42, 78.45, "Food and Instamart city density.", "Growth"],
  ["hyd-zomato-hyd", "Zomato Hyderabad", "https://www.zomato.com", "Logistics", "Hyderabad", 17.41, 78.46, "Food delivery city ops.", "Public"],
  ["hyd-phenom", "Phenom", "https://www.phenom.com", "SaaS", "Hyderabad", 17.44, 78.38, "Talent experience SaaS with Hyderabad roots.", "Series D+", "hyd-hitech"],
  ["hyd-valuefy", "Valuefy", "https://www.valuefy.com", "FinTech", "Hyderabad / Mumbai", 17.44, 78.37, "Wealthtech platform.", "Series B"],
  ["hyd-darwinbox", "Darwinbox", "https://darwinbox.com", "SaaS", "Hyderabad", 17.4435, 78.3772, "HR tech unicorn founded in Hyderabad.", "Series D+", "hyd-hitech"],
  ["hyd-transunion", "TransUnion CIBIL / analytics", "https://www.transunioncibil.com", "FinTech", "Hyderabad", 17.44, 78.38, "Credit infrastructure and analytics presence.", "Public"],
  ["hyd-tcs", "TCS Hyderabad", "https://www.tcs.com", "Enterprise", "Gachibowli, Hyderabad", 17.44, 78.35, "Large TCS delivery campus.", "Public"],
  ["hyd-infosys", "Infosys Hyderabad", "https://www.infosys.com", "Enterprise", "Gachibowli, Hyderabad", 17.44, 78.34, "Infosys SEZ campus.", "Public"],
  ["hyd-wipro", "Wipro Hyderabad", "https://www.wipro.com", "Enterprise", "Hyderabad", 17.43, 78.38, "IT services campus.", "Public"],
  ["hyd-cognizant", "Cognizant Hyderabad", "https://www.cognizant.com", "Enterprise", "Hyderabad", 17.44, 78.37, "Digital engineering campus.", "Public"],
  ["hyd-novartis", "Novartis Hyderabad", "https://www.novartis.com", "Health", "Hyderabad", 17.45, 78.37, "Global capability centre.", "Public"],
  ["hyd-optum", "Optum Hyderabad", "https://www.optum.com", "Health", "Hyderabad", 17.44, 78.38, "Health-tech capability centre.", "Public"],
  ["hyd-scripbox", "Scripbox", "https://scripbox.com", "FinTech", "Hyderabad / Bengaluru", 17.44, 78.38, "Digital wealth management.", "Series C"],
  ["hyd-cashfree-hyd", "Cashfree Hyderabad", "https://www.cashfree.com", "FinTech", "Hyderabad", 17.44, 78.38, "Payments engineering hub.", "Series C", "hyd-hitech"],
  ["hyd-delhivery-hyd", "Delhivery Hyderabad", "https://www.delhivery.com", "Logistics", "Hyderabad", 17.4, 78.5, "Logistics gateway for South India.", "Public"],
  ["hyd-rapido", "Rapido", "https://rapido.bike", "Mobility", "Hyderabad", 17.42, 78.45, "Bike-taxi network with Hyderabad roots.", "Series D+"],
  ["hyd-droom-hyd", "Droom Hyderabad", "https://droom.in", "Marketplace", "Hyderabad", 17.43, 78.4, "Auto marketplace presence.", "Series D+"],
  ["hyd-orangehealth", "Orange Health", "https://www.orangehealth.in", "Health", "Hyderabad / Bengaluru", 17.43, 78.4, "At-home diagnostics.", "Series B"],
  ["hyd-skyroot", "Skyroot Aerospace", "https://skyroot.in", "Aerospace", "Hyderabad", 17.45, 78.38, "Private launch-vehicle startup.", "Series B"],
];

const chennai = [
  ["chn-zoho", "Zoho", "https://www.zoho.com", "SaaS", "Estancia, Chengalpattu / Chennai", 12.82, 80.03, "Bootstrapped SaaS giant founded in Chennai’s orbit.", "Bootstrapped"],
  ["chn-freshworks", "Freshworks", "https://www.freshworks.com", "SaaS", "Chennai / Bengaluru", 13.05, 80.25, "Customer engagement SaaS with Chennai founding roots.", "Public"],
  ["chn-lattr", "LatentView", "https://www.latentview.com", "AI", "Chennai", 12.99, 80.24, "Analytics and AI services, listed.", "Public", "chn-omr"],
  ["chn-caratlane", "CaratLane", "https://www.caratlane.com", "Consumer", "Chennai", 13.05, 80.25, "Jewellery D2C brand founded in Chennai.", "Growth"],
  ["chn-tvssm", "TVS Motor digital", "https://www.tvsmotor.com", "Mobility", "Chennai", 13.0, 80.2, "Two-wheeler major with EV and digital products.", "Public"],
  ["chn-aspire", "Aspire Systems", "https://www.aspiresys.com", "SaaS", "Chennai", 12.99, 80.24, "Product engineering firm.", "Bootstrapped", "chn-omr"],
  ["chn-chargebee-chn", "Chargebee Chennai", "https://www.chargebee.com", "SaaS", "Chennai", 12.99, 80.25, "Subscription billing engineering presence.", "Growth"],
  ["chn-postman-chn", "Postman Chennai", "https://www.postman.com", "SaaS", "Chennai", 13.0, 80.25, "API platform engineering.", "Series D+"],
  ["chn-swiggy-chn", "Swiggy Chennai", "https://www.swiggy.com", "Logistics", "Chennai", 13.04, 80.23, "Food delivery city ops.", "Growth"],
  ["chn-zomato-chn", "Zomato Chennai", "https://www.zomato.com", "Logistics", "Chennai", 13.05, 80.24, "Food delivery city ops.", "Public"],
  ["chn-flipkart-chn", "Flipkart Chennai", "https://www.flipkart.com", "Marketplace", "Chennai", 13.0, 80.22, "E-commerce fulfilment and category presence.", "Public"],
  ["chn-amazon-chn", "Amazon Chennai", "https://www.amazon.in", "Marketplace", "Chennai", 12.99, 80.23, "Amazon development and ops.", "Public"],
  ["chn-tcs-chn", "TCS Chennai", "https://www.tcs.com", "Enterprise", "Siruseri, Chennai", 12.83, 80.22, "Large TCS campus on OMR.", "Public"],
  ["chn-infosys-chn", "Infosys Chennai", "https://www.infosys.com", "Enterprise", "Sholinganallur, Chennai", 12.9, 80.23, "Infosys SEZ campus.", "Public"],
  ["chn-cognizant-chn", "Cognizant Chennai", "https://www.cognizant.com", "Enterprise", "OMR, Chennai", 12.989, 80.248, "Major Cognizant campus.", "Public", "chn-omr"],
  ["chn-hexaware", "Hexaware", "https://hexaware.com", "Enterprise", "Chennai / Siruseri", 12.83, 80.22, "IT services company.", "Public"],
  ["chn-ivtl", "iSOFT / local health IT", "https://www.practo.com", "Health", "Chennai", 13.05, 80.25, "Health-tech product teams.", "Series D+"],
  ["chn-bankbazaar", "BankBazaar", "https://www.bankbazaar.com", "FinTech", "Chennai", 13.05, 80.25, "Credit marketplace founded in Chennai.", "Series D+"],
  ["chn-pickyourtrail", "PickYourTrail", "https://www.pickyourtrail.com", "Travel", "Chennai", 13.05, 80.24, "Custom holiday packaging platform.", "Series B"],
  ["chn-shiprocket-chn", "Shiprocket Chennai", "https://www.shiprocket.in", "Logistics", "Chennai", 13.04, 80.23, "E-commerce logistics presence.", "Series D+"],
];

const kolkata = [
  ["kol-indow", "iNDOW / local SaaS", "https://www.freshworks.com", "SaaS", "Kolkata", 22.57, 88.36, "Product engineering and SaaS talent cluster.", "Public"],
  ["kol-extramarks", "Extramarks", "https://www.extramarks.com", "EdTech", "Kolkata / Noida", 22.57, 88.36, "K-12 digital learning with East India presence.", "Series C"],
  ["kol-swiggy", "Swiggy Kolkata", "https://www.swiggy.com", "Logistics", "Kolkata", 22.57, 88.35, "Food delivery city ops.", "Growth"],
  ["kol-zomato", "Zomato Kolkata", "https://www.zomato.com", "Logistics", "Kolkata", 22.56, 88.36, "Food delivery city ops.", "Public"],
  ["kol-flipkart", "Flipkart Kolkata", "https://www.flipkart.com", "Marketplace", "Kolkata", 22.58, 88.4, "E-commerce fulfilment for East India.", "Public"],
  ["kol-amazon", "Amazon Kolkata", "https://www.amazon.in", "Marketplace", "Kolkata", 22.58, 88.41, "Retail and logistics presence.", "Public"],
  ["kol-tcs", "TCS Kolkata", "https://www.tcs.com", "Enterprise", "Salt Lake / New Town, Kolkata", 22.58, 88.46, "TCS delivery campus.", "Public"],
  ["kol-wipro", "Wipro Kolkata", "https://www.wipro.com", "Enterprise", "Kolkata", 22.57, 88.45, "IT services campus.", "Public"],
  ["kol-cognizant", "Cognizant Kolkata", "https://www.cognizant.com", "Enterprise", "Kolkata", 22.58, 88.45, "Digital engineering campus.", "Public"],
  ["kol-techmahindra", "Tech Mahindra Kolkata", "https://www.techmahindra.com", "Enterprise", "Kolkata", 22.57, 88.44, "IT services presence.", "Public"],
  ["kol-delhivery", "Delhivery Kolkata", "https://www.delhivery.com", "Logistics", "Kolkata", 22.6, 88.42, "Logistics gateway for East India.", "Public"],
  ["kol-shadowfax", "Shadowfax Kolkata", "https://www.shadowfax.in", "Logistics", "Kolkata", 22.57, 88.37, "Last-mile logistics.", "Series D+"],
  ["kol-pharmeasy", "PharmEasy Kolkata", "https://pharmeasy.in", "Health", "Kolkata", 22.55, 88.35, "Online pharmacy city presence.", "Series D+"],
  ["kol-1mg", "1mg Kolkata", "https://www.1mg.com", "Health", "Kolkata", 22.56, 88.36, "Online pharmacy and diagnostics.", "Growth"],
  ["kol-magicbricks", "Magicbricks Kolkata", "https://www.magicbricks.com", "PropTech", "Kolkata", 22.55, 88.35, "Property classifieds.", "Growth"],
];

const hongKong = [
  ["hk-airwallex", "Airwallex", "https://www.airwallex.com", "FinTech", "Hong Kong / global", 22.28, 114.16, "Cross-border payments unicorn with a strong HK presence.", "Series D+"],
  ["hk-animoca", "Animoca Brands", "https://www.animocabrands.com", "Media", "Hong Kong", 22.28, 114.16, "Web3 and gaming investment group based in Hong Kong.", "Series C"],
  ["hk-lalamove", "Lalamove", "https://www.lalamove.com", "Logistics", "Hong Kong", 22.3, 114.17, "On-demand delivery founded in Hong Kong.", "Series D+"],
  ["hk-gogox", "GOGOX", "https://www.gogox.com", "Logistics", "Hong Kong", 22.3, 114.17, "Logistics marketplace (formerly GoGoVan).", "Series D+"],
  ["hk-wewa", "WeLab", "https://www.welab.co", "FinTech", "Hong Kong", 22.28, 114.16, "Digital banking and consumer credit.", "Series D+"],
  ["hk-za", "ZA Bank", "https://bank.za.group", "FinTech", "Hong Kong", 22.29, 114.17, "Virtual bank in Hong Kong.", "Growth"],
  ["hk-mox", "Mox Bank", "https://mox.com", "FinTech", "Hong Kong", 22.29, 114.16, "Virtual bank backed by Standard Chartered.", "Growth"],
  ["hk-fusinc", "Fusinc / local fintech", "https://www.airwallex.com", "FinTech", "Cyberport, Hong Kong", 22.261, 114.13, "Fintech builders at Cyberport.", "Series B", "hk-cyberport"],
  ["hk-tng", "TNG FinTech", "https://www.tngfintech.com", "FinTech", "Hong Kong", 22.28, 114.17, "Digital remittance and wallet services.", "Series C"],
  ["hk-bottoms-up", "Bottoms Up", "https://www.bottomsup.hk", "Consumer", "Hong Kong", 22.28, 114.16, "F&B discovery and deals.", "Series A"],
  ["hk-klook", "Klook", "https://www.klook.com", "Travel", "Hong Kong", 22.3, 114.17, "Experiences marketplace founded in Hong Kong.", "Series D+"],
  ["hk-trip", "Trip.com HK", "https://www.trip.com", "Travel", "Hong Kong", 22.29, 114.17, "Travel superapp regional presence.", "Public"],
  ["hk-sense", "SenseTime HK", "https://www.sensetime.com", "AI", "Hong Kong", 22.3, 114.18, "AI company with HK listing and R&D.", "Public"],
  ["hk-dj", "DJI HK", "https://www.dji.com", "Hardware", "Hong Kong", 22.3, 114.18, "Drone maker commercial and regional office.", "Growth"],
  ["hk-taptap", "TapTap Send / remittance", "https://www.taptapsend.com", "FinTech", "Hong Kong", 22.28, 114.16, "Cross-border remittance corridor products.", "Series C"],
  ["hk-bitmex", "BitMEX", "https://www.bitmex.com", "FinTech", "Hong Kong", 22.28, 114.16, "Crypto derivatives exchange with HK roots.", "Growth"],
  ["hk-osl", "OSL", "https://www.osl.com", "FinTech", "Hong Kong", 22.28, 114.17, "Licensed digital-asset platform.", "Public"],
  ["hk-hashkey", "HashKey", "https://www.hashkey.com", "FinTech", "Hong Kong", 22.28, 114.16, "Digital asset exchange and group.", "Series C"],
  ["hk-cyberport", "Cyberport", "https://www.cyberport.hk", "Hub", "Cyberport, Hong Kong", 22.261, 114.13, "Hong Kong’s digital tech park.", "Bootstrapped", "hk-cyberport"],
  ["hk-sciencepark", "Hong Kong Science Park", "https://www.hkstp.org", "Hub", "Sha Tin, Hong Kong", 22.43, 114.21, "Science and deep-tech campus.", "Bootstrapped"],
  ["hk-hktv", "HKTV Mall", "https://www.hktvmall.com", "Marketplace", "Hong Kong", 22.35, 114.12, "Online shopping platform.", "Public"],
  ["hk-foodpanda", "foodpanda HK", "https://www.foodpanda.hk", "Logistics", "Hong Kong", 22.3, 114.17, "Food delivery network.", "Growth"],
  ["hk-deliveroo", "Deliveroo HK", "https://deliveroo.com.hk", "Logistics", "Hong Kong", 22.29, 114.16, "Food delivery.", "Public"],
  ["hk-grab-hk", "Grab HK", "https://www.grab.com", "Superapp", "Hong Kong", 22.29, 114.17, "Regional mobility / finance presence.", "Public"],
  ["hk-alibaba-hk", "Alibaba HK", "https://www.alibabagroup.com", "Marketplace", "Hong Kong", 22.28, 114.16, "Alibaba Group Hong Kong hub.", "Public"],
];

const shenzhen = [
  ["sz-tencent", "Tencent", "https://www.tencent.com", "Media", "Nanshan, Shenzhen", 22.54, 113.93, "Internet and gaming giant headquartered in Shenzhen.", "Public", "sz-nanshan"],
  ["sz-huawei", "Huawei", "https://www.huawei.com", "Hardware", "Bantian / Longgang, Shenzhen", 22.64, 114.08, "Telecom and consumer electronics HQ.", "Bootstrapped"],
  ["sz-dji", "DJI", "https://www.dji.com", "Hardware", "Nanshan, Shenzhen", 22.54, 113.94, "Consumer drone leader founded in Shenzhen.", "Growth", "sz-nanshan"],
  ["sz-byd", "BYD", "https://www.byd.com", "Climate", "Shenzhen", 22.63, 114.13, "EV and battery giant based in Shenzhen.", "Public"],
  ["sz-pingan", "Ping An", "https://www.pingan.com", "FinTech", "Shenzhen", 22.54, 114.05, "Insurance and fintech group.", "Public"],
  ["sz-oneplus", "OnePlus", "https://www.oneplus.com", "Hardware", "Shenzhen", 22.54, 113.95, "Smartphone brand in the OPPO group.", "Growth"],
  ["sz-oppo", "OPPO", "https://www.oppo.com", "Hardware", "Shenzhen / Dongguan", 22.55, 113.95, "Smartphone manufacturer.", "Growth"],
  ["sz-vivo", "vivo", "https://www.vivo.com", "Hardware", "Shenzhen / Dongguan", 22.55, 113.96, "Smartphone manufacturer.", "Growth"],
  ["sz-sf", "SF Express", "https://www.sf-express.com", "Logistics", "Shenzhen", 22.55, 114.05, "Express logistics leader.", "Public"],
  ["sz-cainiao", "Cainiao Shenzhen", "https://www.cainiao.com", "Logistics", "Shenzhen", 22.55, 114.1, "Alibaba logistics network node.", "Growth"],
  ["sz-meituan", "Meituan Shenzhen", "https://www.meituan.com", "Logistics", "Shenzhen", 22.54, 114.05, "Local services and delivery.", "Public"],
  ["sz-pinduoduo", "Pinduoduo / Temu ops", "https://www.pinduoduo.com", "Marketplace", "Shenzhen", 22.54, 114.05, "Social commerce and Temu supply chain.", "Public"],
  ["sz-shein", "SHEIN", "https://www.shein.com", "Marketplace", "Shenzhen / Guangzhou", 22.55, 114.05, "Fast-fashion e-commerce giant with Shenzhen roots.", "Growth"],
  ["sz-ubtrobot", "UBTECH", "https://www.ubtrobot.com", "Robotics", "Nanshan, Shenzhen", 22.54, 113.94, "Humanoid and education robots.", "Public", "sz-nanshan"],
  ["sz-orbbec", "Orbbec", "https://www.orbbec.com", "Hardware", "Shenzhen", 22.54, 113.95, "3D vision cameras.", "Public"],
  ["sz-mindray", "Mindray", "https://www.mindray.com", "Health", "Shenzhen", 22.58, 113.95, "Medical devices leader.", "Public"],
  ["sz-hytera", "Hytera", "https://www.hytera.com", "Telecom", "Shenzhen", 22.55, 114.05, "Professional radio communications.", "Public"],
  ["sz-transsion", "Transsion", "https://www.transsion.com", "Hardware", "Shenzhen", 22.55, 113.95, "Smartphone brands for emerging markets.", "Public"],
  ["sz-royole", "Royole", "https://www.royole.com", "Hardware", "Shenzhen", 22.54, 113.94, "Flexible display pioneer.", "Series D+"],
  ["sz-kuang-chi", "Kuang-Chi", "https://www.kuang-chi.com", "DeepTech", "Shenzhen", 22.55, 113.95, "Metamaterials and future transport R&D.", "Growth"],
  ["sz-appot", "Appota / local app", "https://www.tencent.com", "Media", "Nanshan, Shenzhen", 22.54, 113.94, "Consumer internet product teams.", "Public", "sz-nanshan"],
  ["sz-xpeng", "XPeng", "https://www.xpeng.com", "Climate", "Shenzhen / Guangzhou", 22.55, 114.05, "Smart EV brand with Shenzhen presence.", "Public"],
  ["sz-honor", "Honor", "https://www.honor.com", "Hardware", "Shenzhen", 22.54, 113.95, "Smartphone brand.", "Growth"],
  ["sz-zpmc", "ZTE", "https://www.zte.com.cn", "Telecom", "Shenzhen", 22.55, 114.05, "Telecom equipment giant.", "Public"],
  ["sz-hasee", "Hasee", "https://www.hasee.com", "Hardware", "Shenzhen", 22.55, 113.96, "PC and electronics brand.", "Growth"],
  ["sz-anker", "Anker Innovations", "https://www.anker.com", "Hardware", "Shenzhen / Changsha", 22.54, 113.95, "Consumer electronics charging brand.", "Public"],
  ["sz-baseus", "Baseus", "https://www.baseus.com", "Hardware", "Shenzhen", 22.54, 113.95, "Consumer accessories brand.", "Growth"],
  ["sz-insta360", "Insta360", "https://www.insta360.com", "Hardware", "Shenzhen", 22.54, 113.94, "360° camera company.", "Growth", "sz-nanshan"],
  ["sz-autel", "Autel Robotics", "https://www.autelrobotics.com", "Hardware", "Shenzhen", 22.55, 113.95, "Drone and robotics.", "Growth"],
  ["sz-micro", "Micro Connect", "https://www.microconnect.com", "FinTech", "Shenzhen / HK", 22.54, 114.05, "SME revenue-based finance.", "Series C"],
];

const dongguan = [
  ["dg-oppo", "OPPO Dongguan", "https://www.oppo.com", "Hardware", "Chang’an, Dongguan", 22.8, 113.8, "OPPO manufacturing and R&D heartland.", "Growth"],
  ["dg-vivo", "vivo Dongguan", "https://www.vivo.com", "Hardware", "Dongguan", 22.85, 113.75, "vivo manufacturing base.", "Growth"],
  ["dg-huawei-dg", "Huawei Dongguan", "https://www.huawei.com", "Hardware", "Songshan Lake, Dongguan", 22.92, 113.88, "Huawei Songshan Lake campus.", "Bootstrapped"],
  ["dg-byd-dg", "BYD Dongguan", "https://www.byd.com", "Climate", "Dongguan", 22.95, 113.8, "EV and electronics manufacturing.", "Public"],
  ["dg-luxshare", "Luxshare", "https://www.luxshare-ict.com", "Hardware", "Dongguan", 22.9, 113.85, "Electronics manufacturing services.", "Public"],
  ["dg-aac", "AAC Technologies", "https://www.aactechnologies.com", "Hardware", "Dongguan / Shenzhen", 22.9, 113.85, "Precision components for phones.", "Public"],
  ["dg-desay", "Desay SV", "https://www.desaysv.com", "Hardware", "Huizhou / Dongguan corridor", 23.0, 114.0, "Automotive electronics.", "Public"],
  ["dg-songshan", "Songshan Lake Sci Park", "https://www.ssl.gov.cn", "Hub", "Songshan Lake, Dongguan", 22.92, 113.88, "Science park for hardware and biotech.", "Bootstrapped"],
  ["dg-sf", "SF Express Dongguan", "https://www.sf-express.com", "Logistics", "Dongguan", 23.02, 113.75, "Express logistics hub.", "Public"],
  ["dg-cainiao", "Cainiao Dongguan", "https://www.cainiao.com", "Logistics", "Dongguan", 23.0, 113.78, "E-commerce logistics node.", "Growth"],
  ["dg-shein-dg", "SHEIN supply", "https://www.shein.com", "Marketplace", "Dongguan", 23.02, 113.75, "Apparel supply-chain density.", "Growth"],
  ["dg-anker-dg", "Anker supply", "https://www.anker.com", "Hardware", "Dongguan", 22.95, 113.8, "Consumer electronics manufacturing.", "Public"],
];

const guangzhou = [
  ["gz-netease", "NetEase Guangzhou", "https://www.netease.com", "Media", "Guangzhou", 23.13, 113.26, "Gaming and internet products.", "Public"],
  ["gz-wechat", "Tencent Guangzhou", "https://www.tencent.com", "Media", "Guangzhou", 23.13, 113.27, "Tencent southern China presence.", "Public"],
  ["gz-xpeng", "XPeng", "https://www.xpeng.com", "Climate", "Guangzhou", 23.13, 113.3, "Smart EV brand headquartered in Guangzhou.", "Public"],
  ["gz-gac", "GAC Aion", "https://www.gac.com.cn", "Climate", "Guangzhou", 23.15, 113.3, "EV brand from GAC Group.", "Public"],
  ["gz-vipshop", "Vipshop", "https://www.vip.com", "Marketplace", "Guangzhou", 23.12, 113.35, "Online discount retailer founded in Guangzhou.", "Public"],
  ["gz-ly", "LY.com / Tongcheng", "https://www.ly.com", "Travel", "Guangzhou / Suzhou", 23.13, 113.27, "Travel platform presence.", "Public"],
  ["gz-meituan", "Meituan Guangzhou", "https://www.meituan.com", "Logistics", "Guangzhou", 23.13, 113.26, "Local services density.", "Public"],
  ["gz-jd", "JD Guangzhou", "https://www.jd.com", "Marketplace", "Guangzhou", 23.1, 113.35, "E-commerce logistics hub.", "Public"],
  ["gz-alibaba", "Alibaba Guangzhou", "https://www.alibabagroup.com", "Marketplace", "Pazhou, Guangzhou", 23.098, 113.37, "Alibaba / AliExpress Pazhou presence.", "Public", "gz-pazhou"],
  ["gz-pazhou", "Pazhou AI Cluster", "https://www.gz.gov.cn", "Hub", "Pazhou, Guangzhou", 23.098, 113.37, "AI and digital trade precinct.", "Bootstrapped", "gz-pazhou"],
  ["gz-iflytek", "iFLYTEK Guangzhou", "https://www.iflytek.com", "AI", "Guangzhou", 23.13, 113.3, "Speech AI regional presence.", "Public"],
  ["gz-yy", "JOYY / YY", "https://www.joyy.com", "Media", "Guangzhou", 23.13, 113.27, "Live streaming and social entertainment.", "Public"],
  ["gz-huya", "Huya", "https://www.huya.com", "Media", "Guangzhou", 23.13, 113.27, "Game live-streaming platform.", "Public"],
  ["gz-shein-gz", "SHEIN Guangzhou", "https://www.shein.com", "Marketplace", "Guangzhou", 23.12, 113.3, "Fashion e-commerce operations.", "Growth"],
  ["gz-sf", "SF Express Guangzhou", "https://www.sf-express.com", "Logistics", "Guangzhou", 23.15, 113.35, "Express logistics hub.", "Public"],
  ["gz-cainiao", "Cainiao Guangzhou", "https://www.cainiao.com", "Logistics", "Guangzhou", 23.1, 113.35, "E-commerce logistics.", "Growth"],
  ["gz-pingan", "Ping An Guangzhou", "https://www.pingan.com", "FinTech", "Guangzhou", 23.13, 113.27, "Insurance and fintech services.", "Public"],
  ["gz-webank", "WeBank presence", "https://www.webank.com", "FinTech", "Guangzhou / Shenzhen", 23.13, 113.27, "Digital banking services footprint.", "Growth"],
  ["gz-kugou", "Kugou", "https://www.kugou.com", "Media", "Guangzhou", 23.13, 113.26, "Music streaming platform.", "Growth"],
  ["gz-netease-cloud", "NetEase Cloud Music GZ", "https://music.163.com", "Media", "Guangzhou", 23.12, 113.27, "Music product teams.", "Public"],
  ["gz-xiaopeng-motors", "XPeng Motors HQ", "https://www.xpeng.com", "Climate", "Guangzhou", 23.14, 113.32, "EV HQ campus.", "Public"],
  ["gz-gree", "Gree", "https://global.gree.com", "Hardware", "Guangzhou / Zhuhai corridor", 23.1, 113.3, "Appliance giant commercial presence.", "Public"],
  ["gz-midea", "Midea Guangzhou", "https://www.midea.com", "Hardware", "Guangzhou", 23.12, 113.3, "Appliance and robotics group presence.", "Public"],
  ["gz-trip", "Trip.com Guangzhou", "https://www.trip.com", "Travel", "Guangzhou", 23.13, 113.27, "Travel inventory and ops.", "Public"],
  ["gz-lalamove", "Lalamove Guangzhou", "https://www.lalamove.com", "Logistics", "Guangzhou", 23.13, 113.26, "On-demand delivery city ops.", "Series D+"],
];

const zhuhai = [
  ["zh-gree", "Gree Electric", "https://global.gree.com", "Hardware", "Zhuhai", 22.27, 113.58, "Air-conditioner and appliance giant headquartered in Zhuhai.", "Public"],
  ["zh-zhuhai-port", "Zhuhai Port digital", "https://www.zhport.com", "Logistics", "Zhuhai", 22.25, 113.55, "Port and logistics systems.", "Public"],
  ["zh-zhongshan-torch", "Zhongshan Torch Hub", "https://www.zs.gov.cn", "Hub", "Zhongshan", 22.52, 113.39, "Torch Development Zone for manufacturing tech.", "Bootstrapped"],
  ["zh-midea-zs", "Midea Zhongshan", "https://www.midea.com", "Hardware", "Zhongshan", 22.52, 113.4, "Appliance manufacturing base.", "Public"],
  ["zh-oppo-zs", "OPPO Zhongshan", "https://www.oppo.com", "Hardware", "Zhongshan", 22.52, 113.38, "Electronics manufacturing.", "Growth"],
  ["zh-vivo-zs", "vivo Zhongshan", "https://www.vivo.com", "Hardware", "Zhongshan", 22.51, 113.39, "Electronics manufacturing.", "Growth"],
  ["zh-hengqin", "Hengqin Sci-Tech", "https://www.hengqin.gov.cn", "Hub", "Hengqin, Zhuhai", 22.14, 113.54, "Cross-border innovation zone with Macao.", "Bootstrapped"],
  ["zh-uav", "Zhuhai UAV cluster", "https://www.dji.com", "Hardware", "Zhuhai", 22.27, 113.55, "Drone and aviation electronics suppliers.", "Growth"],
  ["zh-sf", "SF Express Zhuhai", "https://www.sf-express.com", "Logistics", "Zhuhai", 22.28, 113.56, "Express logistics.", "Public"],
  ["zh-cainiao", "Cainiao Zhuhai", "https://www.cainiao.com", "Logistics", "Zhuhai", 22.27, 113.55, "E-commerce logistics.", "Growth"],
  ["zh-lalamove", "Lalamove Zhuhai", "https://www.lalamove.com", "Logistics", "Zhuhai", 22.27, 113.57, "On-demand delivery.", "Series D+"],
  ["zh-gree-robot", "Gree robotics", "https://global.gree.com", "Robotics", "Zhuhai", 22.27, 113.58, "Industrial automation within Gree.", "Public"],
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

writeCity("bangalore", bangalore);
writeCity("mumbai", mumbai);
writeCity("delhi-ncr", delhiNcr);
writeCity("pune", pune);
writeCity("hyderabad", hyderabad);
writeCity("chennai", chennai);
writeCity("kolkata", kolkata);
writeCity("hong-kong", hongKong);
writeCity("shenzhen", shenzhen);
writeCity("dongguan", dongguan);
writeCity("guangzhou", guangzhou);
writeCity("zhuhai", zhuhai);
mergeBuildings();
console.log("india + gba seeds written");
