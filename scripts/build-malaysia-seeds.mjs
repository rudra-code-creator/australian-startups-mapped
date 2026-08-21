/**
 * Writes curated seed JSON for Malaysian cities and merges hub buildings.
 * Usage: node scripts/build-malaysia-seeds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const startupsDir = path.join(dataDir, "startups");

const BUILDINGS = {
  "jb-utm-technovation": {
    name: "UTM Technovation Park",
    city: "johor-bahru",
    lat: 1.5594,
    lng: 103.638,
    address: "UTM Skudai, Johor Bahru",
  },
  "jb-medini": {
    name: "Medini Iskandar",
    city: "johor-bahru",
    lat: 1.4178,
    lng: 103.6264,
    address: "Medini, Iskandar Puteri, Johor",
  },
  "kv-mranti": {
    name: "MRANTI Park",
    city: "klang-valley",
    lat: 2.9212,
    lng: 101.6564,
    address: "MRANTI Park, Cyberjaya, Selangor",
  },
  "kv-bangsar-south": {
    name: "Bangsar South",
    city: "klang-valley",
    lat: 3.1108,
    lng: 101.6656,
    address: "The Vertical, Bangsar South, Kuala Lumpur",
  },
  "penang-cat": {
    name: "@CAT Penang",
    city: "penang",
    lat: 5.3278,
    lng: 100.2876,
    address: "Bayan Lepas, Penang",
  },
  "kuching-sdec": {
    name: "SDEC Digital Village",
    city: "kuching",
    lat: 1.5535,
    lng: 110.3448,
    address: "Kuching, Sarawak",
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
  const file = path.join(startupsDir, `${city}.json`);
  fs.writeFileSync(file, JSON.stringify(startups, null, 2) + "\n");
  console.log(`${city}: ${startups.length}`);
}

const johorBahru = [
  ["jb-easyparcel", "EasyParcel", "https://www.easyparcel.com", "Logistics", "Johor Bahru, Johor", 1.4927, 103.7414, "Shipping aggregator founded in Johor Bahru for SMEs sending across ASEAN."],
  ["jb-utm-technovation", "UTM Technovation Park", "https://www.utm.my", "Hub", "UTM Skudai, Johor Bahru", 1.5594, 103.638, "University tech park and spinout campus in Skudai.", "jb-utm-technovation"],
  ["jb-medini", "Medini Iskandar", "https://www.medini.com.my", "Hub", "Medini, Iskandar Puteri, Johor", 1.4178, 103.6264, "Iskandar Puteri precinct used by regional product and services teams.", "jb-medini"],
  ["jb-irda", "Iskandar Regional Development Authority", "https://www.irda.com.my", "Hub", "Iskandar Puteri, Johor", 1.4224, 103.6148, "Development authority backing the Iskandar Malaysia economic corridor.", "jb-medini"],
  ["jb-pinewood", "Iskandar Malaysia Studios", "https://www.iskandarstudios.com", "Media", "Iskandar Puteri, Johor", 1.4072, 103.6376, "Sound stages and digital production campus in Iskandar."],
  ["jb-southampton", "University of Southampton Malaysia", "https://www.southampton.ac.uk/my", "EdTech", "Educity, Iskandar Puteri, Johor", 1.4286, 103.6192, "Educity campus feeding engineering talent into the JB–Singapore corridor.", "jb-medini"],
  ["jb-ncl", "Newcastle University Medicine Malaysia", "https://www.ncl.ac.uk/numed", "Health", "Educity, Iskandar Puteri, Johor", 1.4292, 103.6186, "Medical campus in Educity, Iskandar.", "jb-medini"],
  ["jb-raffles-u", "Raffles University", "https://www.raffles-university.edu.my", "EdTech", "Medini, Iskandar Puteri, Johor", 1.4184, 103.6268, "Private university in Medini with digital and business programmes.", "jb-medini"],
  ["jb-jcorp", "Johor Corporation", "https://www.jcorp.com.my", "Venture", "Kotaraya, Johor Bahru", 1.4612, 103.7618, "State investment group backing Johor industrial and digital ventures."],
  ["jb-grab", "Grab Johor Bahru", "https://www.grab.com", "Superapp", "City Centre, Johor Bahru", 1.4654, 103.7578, "Grab city operations for the JB–Singapore commute market."],
  ["jb-shopee", "Shopee Johor Bahru", "https://shopee.com.my", "Marketplace", "Tebrau, Johor Bahru", 1.4922, 103.7586, "E-commerce ops and last-mile serving southern Johor."],
  ["jb-foodpanda", "foodpanda Johor Bahru", "https://www.foodpanda.my", "Logistics", "Taman Molek, Johor Bahru", 1.5328, 103.7884, "Delivery network across JB and Iskandar Puteri."],
  ["jb-ninjavan", "Ninja Van Johor", "https://www.ninjavan.co", "Logistics", "Pasir Gudang / JB", 1.4726, 103.8992, "Last-mile hub for the Singapore–Johor parcel flow."],
  ["jb-lalamove", "Lalamove Johor Bahru", "https://www.lalamove.com", "Logistics", "Johor Bahru", 1.4856, 103.7612, "On-demand trucking for the CIQ and PTP corridor."],
  ["jb-carsome", "Carsome Johor Bahru", "https://www.carsome.my", "Marketplace", "Tebrau, Johor Bahru", 1.5486, 103.7534, "Used-car inspection and retail centre."],
  ["jb-storehub", "StoreHub Johor", "https://www.storehub.com", "SaaS", "Johor Bahru", 1.4788, 103.7636, "Cloud POS used widely by JB F&B near the Causeway."],
  ["jb-tng", "Touch 'n Go Johor", "https://www.touchngo.com.my", "FinTech", "CIQ / City Centre, Johor Bahru", 1.4642, 103.7694, "Transit and wallet presence on the JB–Singapore crossing."],
  ["jb-boost", "Boost Johor Bahru", "https://www.myboost.com.my", "FinTech", "Johor Bahru", 1.4772, 103.7588, "e-wallet merchant acquiring in southern Johor."],
  ["jb-ghl", "GHL Johor", "https://www.ghl.com", "FinTech", "Johor Bahru", 1.4796, 103.7604, "Payments acquiring for JB retail and F&B."],
  ["jb-ptp", "Port of Tanjung Pelepas digital", "https://www.ptp.com.my", "Logistics", "Gelang Patah, Johor", 1.3628, 103.5476, "Container port tech serving the Singapore Straits trade."],
  ["jb-uem", "UEM Sunrise Iskandar", "https://www.uemsunrise.com", "PropTech", "Iskandar Puteri, Johor", 1.4248, 103.6372, "Township developer with digital precincts in Iskandar."],
  ["jb-sunway-iskandar", "Sunway Iskandar", "https://www.sunwayiskandar.com", "Hub", "Iskandar Puteri, Johor", 1.4216, 103.6518, "Integrated township used by regional services firms."],
  ["jb-midvalley", "Mid Valley Southkey", "https://www.southkey.com.my", "Hub", "Southkey, Johor Bahru", 1.4756, 103.7784, "Retail and office cluster on the JB waterfront."],
  ["jb-paradigm", "Paradigm Mall JB", "https://www.paradigmmall.com.my", "Hub", "Skudai, Johor Bahru", 1.5288, 103.6816, "Skudai retail campus next to the UTM talent belt."],
  ["jb-marrybrown", "Marrybrown", "https://www.marrybrown.com", "Consumer", "Johor Bahru, Johor", 1.4924, 103.7412, "Quick-service restaurant brand founded in Johor Bahru, now regional."],
];

const malacca = [
  ["mlk-mmu", "Multimedia University Melaka", "https://www.mmu.edu.my", "Hub", "Ayer Keroh, Melaka", 2.2496, 102.2768, "MMU Melaka campus — a long-running source of Malaysian digital talent."],
  ["mlk-mitc", "MITC", "https://www.mitc.org.my", "Hub", "Ayer Keroh, Melaka", 2.2668, 102.2864, "Melaka International Trade Centre for events and tech showcases."],
  ["mlk-grab", "Grab Melaka", "https://www.grab.com", "Superapp", "Melaka City", 2.1964, 102.2406, "City operations for heritage-city mobility and GrabFood."],
  ["mlk-shopee", "Shopee Melaka", "https://shopee.com.my", "Marketplace", "Ayer Keroh, Melaka", 2.2448, 102.2742, "E-commerce ops for the historic city catchment."],
  ["mlk-foodpanda", "foodpanda Melaka", "https://www.foodpanda.my", "Logistics", "Melaka City", 2.1948, 102.2492, "Delivery network across Bandar Hilir and Ayer Keroh."],
  ["mlk-tng", "Touch 'n Go Melaka", "https://www.touchngo.com.my", "FinTech", "Melaka City", 2.1912, 102.2508, "Transit and merchant wallet presence."],
  ["mlk-storehub", "StoreHub Melaka", "https://www.storehub.com", "SaaS", "Jonker Street precinct, Melaka", 2.1956, 102.2498, "Cloud POS for heritage F&B and retail."],
  ["mlk-tourism", "Tourism Melaka digital", "https://www.amazingmelaka.com", "Travel", "Melaka City", 2.1896, 102.2501, "Destination platform and visitor information tech."],
  ["mlk-easyparcel", "EasyParcel Melaka", "https://www.easyparcel.com", "Logistics", "Ayer Keroh, Melaka", 2.2482, 102.2756, "Parcel aggregator used by Melaka SMEs."],
  ["mlk-boost", "Boost Melaka", "https://www.myboost.com.my", "FinTech", "Melaka City", 2.1934, 102.2486, "e-wallet merchant acquiring."],
  ["mlk-ghl", "GHL Melaka", "https://www.ghl.com", "FinTech", "Melaka City", 2.1922, 102.2514, "Card acquiring for tourism retail."],
  ["mlk-ninjavan", "Ninja Van Melaka", "https://www.ninjavan.co", "Logistics", "Ayer Keroh, Melaka", 2.2512, 102.2788, "Last-mile hub."],
  ["mlk-ipay88", "iPay88 Melaka", "https://www.ipay88.com", "FinTech", "Melaka City", 2.1908, 102.2496, "Payment gateway onboarding for tourism merchants."],
  ["mlk-carsome", "Carsome Melaka", "https://www.carsome.my", "Marketplace", "Ayer Keroh, Melaka", 2.2536, 102.2704, "Used-car inspection centre."],
  ["mlk-ump", "UTeM", "https://www.utem.edu.my", "Hub", "Durian Tunggal, Melaka", 2.3136, 102.3208, "Technical university commercialising engineering spinouts."],
];

const klangValley = [
  ["kv-grab", "Grab Malaysia", "https://www.grab.com", "Superapp", "The Vertical, Bangsar South, Kuala Lumpur", 3.1108, 101.6656, "Malaysia HQ for mobility, deliveries, and financial services.", "kv-bangsar-south"],
  ["kv-carsome", "Carsome", "https://www.carsome.my", "Marketplace", "Cyberjaya, Selangor", 2.9212, 101.6564, "Used-car marketplace headquartered in the Klang Valley.", "kv-mranti"],
  ["kv-tng", "TNG Digital", "https://www.touchngo.com.my", "FinTech", "Petaling Jaya, Selangor", 3.1072, 101.6064, "Touch 'n Go eWallet operator, Malaysia’s largest consumer wallet."],
  ["kv-boost", "Boost", "https://www.myboost.com.my", "FinTech", "Axiata Tower, Kuala Lumpur", 3.1118, 101.6652, "Axiata e-wallet and merchant payments.", "kv-bangsar-south"],
  ["kv-bigpay", "BigPay", "https://www.bigpayme.com", "FinTech", "RedQ, KLIA / Kuala Lumpur", 2.7554, 101.7048, "AirAsia-group digital payments and card product."],
  ["kv-airasia", "AirAsia Move", "https://www.airasia.com", "Travel", "RedQ, Sepang / Kuala Lumpur", 2.7558, 101.7042, "Travel superapp and airline digital products."],
  ["kv-teleport", "Teleport", "https://teleport.asia", "Logistics", "KLIA / Kuala Lumpur", 2.7436, 101.7018, "AirAsia cargo and e-commerce logistics."],
  ["kv-shopee", "Shopee Malaysia", "https://shopee.com.my", "Marketplace", "Bangsar South, Kuala Lumpur", 3.1106, 101.6658, "Regional e-commerce with a large KL product team.", "kv-bangsar-south"],
  ["kv-lazada", "Lazada Malaysia", "https://www.lazada.com.my", "Marketplace", "Petaling Jaya, Selangor", 3.1048, 101.6422, "Marketplace operations for Malaysia."],
  ["kv-foodpanda", "foodpanda Malaysia", "https://www.foodpanda.my", "Logistics", "Petaling Jaya, Selangor", 3.1186, 101.6378, "Food delivery network HQ for Malaysia."],
  ["kv-lalamove", "Lalamove Malaysia", "https://www.lalamove.com", "Logistics", "Petaling Jaya, Selangor", 3.0964, 101.6446, "On-demand delivery and trucking."],
  ["kv-ninjavan", "Ninja Van Malaysia", "https://www.ninjavan.co", "Logistics", "Shah Alam, Selangor", 3.0738, 101.5184, "Last-mile sortation in the Klang Valley industrial belt."],
  ["kv-gdex", "GDEX", "https://www.gdexpress.com", "Logistics", "Petaling Jaya, Selangor", 3.0836, 101.6112, "Public logistics group with a strong e-commerce network."],
  ["kv-ipay88", "iPay88", "https://www.ipay88.com", "FinTech", "Kuala Lumpur", 3.1568, 101.7122, "Malaysian payment gateway used by SMEs and enterprises."],
  ["kv-ghl", "GHL Systems", "https://www.ghl.com", "FinTech", "Kuala Lumpur", 3.139, 101.6869, "ASEAN merchant acquiring and payment terminals."],
  ["kv-revenue-monster", "Revenue Monster", "https://www.revenuemonster.my", "FinTech", "Petaling Jaya, Selangor", 3.1024, 101.6288, "Omnichannel payments and loyalty software."],
  ["kv-storehub", "StoreHub", "https://www.storehub.com", "SaaS", "Petaling Jaya, Selangor", 3.1142, 101.6324, "Cloud POS and commerce OS for F&B and retail."],
  ["kv-easystore", "EasyStore", "https://easystore.co", "SaaS", "Petaling Jaya, Selangor", 3.1194, 101.6196, "Malaysian e-commerce store builder."],
  ["kv-kakitangan", "Kakitangan.com", "https://www.kakitangan.com", "SaaS", "Kuala Lumpur", 3.1486, 101.6934, "HR and payroll software for Malaysian SMEs."],
  ["kv-talenox", "Talenox", "https://www.talenox.com", "SaaS", "Kuala Lumpur", 3.1512, 101.7098, "Cloud payroll used across Malaysia and Singapore."],
  ["kv-dropee", "Dropee", "https://www.dropee.com", "Marketplace", "Kuala Lumpur", 3.1468, 101.6956, "B2B wholesale marketplace for FMCG."],
  ["kv-naluri", "Naluri", "https://www.naluri.com", "Health", "Kuala Lumpur", 3.1348, 101.6862, "Digital chronic-care and mental-health platform."],
  ["kv-doctoroncall", "DoctorOnCall", "https://www.doctoroncall.com.my", "Health", "Petaling Jaya, Selangor", 3.1078, 101.6412, "Telehealth marketplace."],
  ["kv-bookdoc", "BookDoc", "https://www.bookdoc.com", "Health", "Petaling Jaya, Selangor", 3.1126, 101.6338, "Healthcare booking and wellness app."],
  ["kv-iproperty", "PropertyGuru / iProperty", "https://www.iproperty.com.my", "PropTech", "Petaling Jaya, Selangor", 3.1018, 101.6472, "Property portal for Malaysia."],
  ["kv-mudah", "Mudah.my", "https://www.mudah.my", "Marketplace", "Petaling Jaya, Selangor", 3.0994, 101.6384, "Classifieds marketplace."],
  ["kv-speedhome", "SPEEDHOME", "https://speedhome.com", "PropTech", "Kuala Lumpur", 3.1582, 101.7114, "Zero-deposit rental platform."],
  ["kv-ringgitplus", "RinggitPlus", "https://www.ringgitplus.com", "FinTech", "Kuala Lumpur", 3.1574, 101.7118, "Personal-finance comparison marketplace."],
  ["kv-imoney", "iMoney", "https://www.imoney.my", "FinTech", "Kuala Lumpur", 3.1492, 101.7136, "Credit card and loan comparison."],
  ["kv-fave", "Fave", "https://www.fave.com", "FinTech", "Bangsar South, Kuala Lumpur", 3.111, 101.6654, "Deals and FavePay merchant network.", "kv-bangsar-south"],
  ["kv-magic", "MaGIC", "https://www.mymagic.my", "Hub", "Cyberjaya, Selangor", 2.9212, 101.6564, "Malaysian Global Innovation & Creativity Centre.", "kv-mranti"],
  ["kv-mranti", "MRANTI", "https://www.mranti.my", "Hub", "MRANTI Park, Cyberjaya, Selangor", 2.9212, 101.6564, "National applied R&D and commercialisation park.", "kv-mranti"],
  ["kv-1337", "1337 Ventures", "https://1337.vc", "Venture", "Kuala Lumpur", 3.1396, 101.6868, "Early-stage Malaysian venture firm."],
  ["kv-gobi", "Gobi Partners", "https://www.gobipartners.com", "Venture", "Kuala Lumpur", 3.1482, 101.7132, "Regional VC with a Kuala Lumpur office."],
  ["kv-setel", "Setel", "https://www.setel.com", "FinTech", "PETRONAS Twin Towers, Kuala Lumpur", 3.1579, 101.7116, "In-car payments and fuel-station commerce from PETRONAS."],
  ["kv-plus-solar", "Plus Solar", "https://www.plussolar.my", "Climate", "Petaling Jaya, Selangor", 3.1088, 101.6124, "Distributed solar for homes and businesses."],
  ["kv-solarvest", "Solarvest", "https://www.solarvest.my", "Climate", "Petaling Jaya, Selangor", 3.0946, 101.6248, "Public solar EPCC and clean-energy platform."],
  ["kv-pitchin", "pitchIN", "https://www.pitchin.my", "FinTech", "Kuala Lumpur", 3.1524, 101.7046, "Equity crowdfunding platform."],
  ["kv-wahed", "Wahed", "https://wahed.com", "FinTech", "Kuala Lumpur", 3.1508, 101.7088, "Halal digital wealth platform with a Malaysia office."],
  ["kv-versa", "Versa", "https://www.versa.com.my", "FinTech", "Kuala Lumpur", 3.1462, 101.6952, "Cash-management and money-market app."],
  ["kv-westports", "Westports digital", "https://www.westportsholdings.com", "Logistics", "Port Klang, Selangor", 3.0318, 101.3614, "Container terminal tech at Port Klang."],
  ["kv-northport", "Northport digital", "https://www.northport.com.my", "Logistics", "Port Klang, Selangor", 3.0136, 101.3928, "Port operator systems on the Klang river mouth."],
  ["kv-jnt-klang", "J&T Klang", "https://www.jtexpress.my", "Logistics", "Klang, Selangor", 3.0449, 101.4456, "Parcel sortation for the Port Klang industrial belt."],
  ["kv-shopee-klang", "Shopee Klang warehouse", "https://shopee.com.my", "Logistics", "Klang, Selangor", 3.0386, 101.4522, "E-commerce fulfilment serving the west-coast catchment."],
  ["kv-mvv", "Malaysia Vision Valley", "https://www.ns.gov.my", "Hub", "Seremban / Nilai, Negeri Sembilan", 2.7258, 101.9378, "Negeri Sembilan growth corridor linking Seremban to the Klang Valley."],
  ["kv-sendayan", "Sendayan TechValley", "https://www.mbs.gov.my", "Hub", "Bandar Sri Sendayan, Seremban", 2.6754, 101.8572, "Industrial-tech park south of Seremban."],
  ["kv-inti-nilai", "INTI Nilai", "https://newinti.edu.my", "EdTech", "Putra Nilai, Negeri Sembilan", 2.8146, 101.7668, "Campus talent pipeline between KLIA and Seremban."],
  ["kv-nilai-logistics", "Nilai e-commerce logistics", "https://www.pos.com.my", "Logistics", "Nilai, Negeri Sembilan", 2.8024, 101.7992, "Warehouse belt used by national parcel and marketplace operators."],
];

const ipoh = [
  ["iph-utp", "UTP", "https://www.utp.edu.my", "Hub", "Seri Iskandar, Perak", 4.3866, 100.9794, "PETRONAS university commercialising energy and digital tech near Ipoh."],
  ["iph-perak-digital", "Perak Digital", "https://www.perak.gov.my", "Hub", "Ipoh, Perak", 4.5975, 101.0901, "State digital economy programmes."],
  ["iph-grab", "Grab Ipoh", "https://www.grab.com", "Superapp", "Ipoh, Perak", 4.5958, 101.0876, "City operations for Kinta Valley mobility and food."],
  ["iph-shopee", "Shopee Ipoh", "https://shopee.com.my", "Marketplace", "Ipoh, Perak", 4.6012, 101.0908, "E-commerce ops for Perak."],
  ["iph-foodpanda", "foodpanda Ipoh", "https://www.foodpanda.my", "Logistics", "Ipoh, Perak", 4.5988, 101.0824, "Delivery network across Ipoh Old Town and Greentown."],
  ["iph-storehub", "StoreHub Ipoh", "https://www.storehub.com", "SaaS", "Ipoh Old Town, Perak", 4.5952, 101.0768, "Cloud POS for Ipoh’s F&B scene."],
  ["iph-tng", "Touch 'n Go Ipoh", "https://www.touchngo.com.my", "FinTech", "Ipoh, Perak", 4.5972, 101.0912, "Transit and merchant wallet presence."],
  ["iph-boost", "Boost Ipoh", "https://www.myboost.com.my", "FinTech", "Ipoh, Perak", 4.5994, 101.0884, "e-wallet acquiring."],
  ["iph-carsome", "Carsome Ipoh", "https://www.carsome.my", "Marketplace", "Ipoh, Perak", 4.5846, 101.0862, "Used-car inspection centre."],
  ["iph-ninjavan", "Ninja Van Ipoh", "https://www.ninjavan.co", "Logistics", "Ipoh, Perak", 4.5728, 101.0946, "Last-mile hub for the Kinta Valley."],
  ["iph-easyparcel", "EasyParcel Ipoh", "https://www.easyparcel.com", "Logistics", "Ipoh, Perak", 4.5964, 101.0894, "Parcel aggregator for Perak SMEs."],
  ["iph-ghl", "GHL Ipoh", "https://www.ghl.com", "FinTech", "Ipoh, Perak", 4.5982, 101.0906, "Merchant acquiring."],
  ["iph-ipay88", "iPay88 Ipoh", "https://www.ipay88.com", "FinTech", "Ipoh, Perak", 4.5978, 101.0888, "Payment gateway onboarding."],
  ["iph-unimap", "UniKL MSI", "https://www.unikl.edu.my", "Hub", "Kulim / Ipoh catchment, Perak", 4.6088, 101.1024, "Technical campus feeding manufacturing-tech talent."],
  ["iph-silverit", "Ipoh software cluster", "https://www.mdec.my", "SaaS", "Greentown, Ipoh", 4.6018, 101.0902, "Greentown services cluster for local software houses."],
];

const penang = [
  ["png-vitrox", "ViTrox", "https://www.vitrox.com", "Hardware", "Bayan Lepas, Penang", 5.2948, 100.2764, "Machine-vision and inspection equipment company based in Penang."],
  ["png-pentamaster", "Pentamaster", "https://www.pentamaster.com.my", "Hardware", "Bayan Lepas, Penang", 5.3012, 100.2718, "Automation and test-equipment group."],
  ["png-inari", "Inari Amertron", "https://www.inari-amertron.com", "Hardware", "Bayan Lepas, Penang", 5.2876, 100.2684, "OSAT semiconductor group headquartered in Penang."],
  ["png-greatech", "Greatech", "https://www.greatech-group.com", "Hardware", "Bayan Lepas, Penang", 5.3056, 100.2692, "Factory automation equipment maker."],
  ["png-uwc", "UWC", "https://www.uwcberhad.com.my", "Hardware", "Bayan Lepas, Penang", 5.2988, 100.2746, "Precision engineering for semiconductor and life-science equipment."],
  ["png-aemulus", "Aemulus", "https://www.aemulus.com", "Hardware", "Bayan Lepas, Penang", 5.3024, 100.2788, "Semiconductor test-system company."],
  ["png-crest", "CREST", "https://www.crest.my", "Hub", "Bayan Lepas, Penang", 5.3278, 100.2876, "Collaborative electronics R&D consortium.", "penang-cat"],
  ["png-cat", "@CAT Penang", "https://www.investpenang.gov.my", "Hub", "Bayan Lepas, Penang", 5.3278, 100.2876, "Penang’s centre for advanced technology and startups.", "penang-cat"],
  ["png-investpenang", "InvestPenang", "https://www.investpenang.gov.my", "Hub", "Komtar, George Town, Penang", 5.4145, 100.3292, "State investment agency for the electronics and digital cluster."],
  ["png-exabytes", "Exabytes", "https://www.exabytes.com", "Cloud", "George Town, Penang", 5.4198, 100.3298, "Web hosting and cloud company founded in Penang."],
  ["png-delivereat", "DeliverEat", "https://www.delivereat.my", "Logistics", "George Town, Penang", 5.4162, 100.3284, "Food delivery startup that began in Penang."],
  ["png-usm", "USM Innovation", "https://www.usm.my", "Hub", "Universiti Sains Malaysia, Penang", 5.3558, 100.3016, "University commercialisation and deep-tech spinouts."],
  ["png-grab", "Grab Penang", "https://www.grab.com", "Superapp", "George Town, Penang", 5.4141, 100.3288, "Island and Seberang Perai operations."],
  ["png-shopee", "Shopee Penang", "https://shopee.com.my", "Marketplace", "Bayan Baru, Penang", 5.3272, 100.2864, "E-commerce ops for the northern region.", "penang-cat"],
  ["png-foodpanda", "foodpanda Penang", "https://www.foodpanda.my", "Logistics", "George Town, Penang", 5.4156, 100.3312, "Delivery network across the island."],
  ["png-carsome", "Carsome Penang", "https://www.carsome.my", "Marketplace", "Seberang Jaya, Penang", 5.3984, 100.3986, "Used-car centre on the mainland."],
  ["png-storehub", "StoreHub Penang", "https://www.storehub.com", "SaaS", "George Town, Penang", 5.4184, 100.3412, "Cloud POS for island F&B."],
  ["png-tng", "Touch 'n Go Penang", "https://www.touchngo.com.my", "FinTech", "George Town, Penang", 5.4128, 100.3276, "Transit and merchant wallet presence."],
  ["png-boost", "Boost Penang", "https://www.myboost.com.my", "FinTech", "Gurney, Penang", 5.4368, 100.3102, "e-wallet acquiring."],
  ["png-ghl", "GHL Penang", "https://www.ghl.com", "FinTech", "George Town, Penang", 5.4168, 100.3304, "Merchant acquiring."],
  ["png-ipay88", "iPay88 Penang", "https://www.ipay88.com", "FinTech", "George Town, Penang", 5.4172, 100.3282, "Payment gateway onboarding."],
  ["png-ninjavan", "Ninja Van Penang", "https://www.ninjavan.co", "Logistics", "Perai, Penang", 5.3846, 100.4012, "Last-mile hub for the mainland industrial belt."],
  ["png-lalamove", "Lalamove Penang", "https://www.lalamove.com", "Logistics", "George Town, Penang", 5.4112, 100.3324, "On-demand delivery."],
  ["png-easyparcel", "EasyParcel Penang", "https://www.easyparcel.com", "Logistics", "George Town, Penang", 5.4152, 100.3272, "Shipping aggregator."],
  ["png-science-park", "Penang Science Park", "https://psh.com.my", "Hub", "Bayan Lepas, Penang", 5.2872, 100.2628, "Electronics industrial park next to the airport."],
  ["png-plexus", "Plexus Penang", "https://www.plexus.com", "Hardware", "Bayan Lepas, Penang", 5.2914, 100.2702, "Electronics manufacturing services campus."],
  ["png-naluri", "Naluri Penang", "https://www.naluri.com", "Health", "George Town, Penang", 5.4192, 100.3328, "Digital health presence serving northern clinics."],
  ["png-revenuemonster", "Revenue Monster Penang", "https://www.revenuemonster.my", "FinTech", "George Town, Penang", 5.4164, 100.3296, "Omnichannel payments for island merchants."],
  ["png-fave", "Fave Penang", "https://www.fave.com", "FinTech", "Gurney, Penang", 5.4372, 100.3096, "Deals and FavePay network."],
  ["png-propertyguru", "iProperty Penang", "https://www.iproperty.com.my", "PropTech", "George Town, Penang", 5.4204, 100.3306, "Property portal city team."],
];

const kuantan = [
  ["ktn-ump", "UMPSA", "https://www.umpsa.edu.my", "Hub", "Gambang, Kuantan, Pahang", 3.7186, 103.1208, "Universiti Malaysia Pahang-Pekan/Gambang engineering commercialisation."],
  ["ktn-gebeng", "Gebeng industrial digital", "https://www.pahang.gov.my", "Hub", "Gebeng, Kuantan, Pahang", 3.9688, 103.3736, "Petrochemical and industrial-tech cluster north of Kuantan."],
  ["ktn-kuantan-port", "Kuantan Port digital", "https://www.kuantanport.com.my", "Logistics", "Tanjung Gelang, Kuantan", 3.9754, 103.4292, "East-coast deepwater port systems."],
  ["ktn-grab", "Grab Kuantan", "https://www.grab.com", "Superapp", "Kuantan, Pahang", 3.8077, 103.326, "City operations for the east coast."],
  ["ktn-shopee", "Shopee Kuantan", "https://shopee.com.my", "Marketplace", "Kuantan, Pahang", 3.8124, 103.3236, "E-commerce ops for Pahang."],
  ["ktn-foodpanda", "foodpanda Kuantan", "https://www.foodpanda.my", "Logistics", "Kuantan, Pahang", 3.8052, 103.3284, "Delivery network."],
  ["ktn-tng", "Touch 'n Go Kuantan", "https://www.touchngo.com.my", "FinTech", "Kuantan, Pahang", 3.8088, 103.3252, "Transit and merchant wallet presence."],
  ["ktn-storehub", "StoreHub Kuantan", "https://www.storehub.com", "SaaS", "Kuantan, Pahang", 3.8064, 103.3272, "Cloud POS for east-coast F&B."],
  ["ktn-ninjavan", "Ninja Van Kuantan", "https://www.ninjavan.co", "Logistics", "Kuantan, Pahang", 3.8196, 103.3188, "Last-mile hub."],
  ["ktn-easyparcel", "EasyParcel Kuantan", "https://www.easyparcel.com", "Logistics", "Kuantan, Pahang", 3.8092, 103.3244, "Parcel aggregator."],
  ["ktn-boost", "Boost Kuantan", "https://www.myboost.com.my", "FinTech", "Kuantan, Pahang", 3.8072, 103.3268, "e-wallet acquiring."],
  ["ktn-carsome", "Carsome Kuantan", "https://www.carsome.my", "Marketplace", "Kuantan, Pahang", 3.8014, 103.3216, "Used-car inspection centre."],
];

const kuching = [
  ["kch-sdec", "SDEC", "https://www.sdec.com.my", "Hub", "Kuching, Sarawak", 1.5535, 110.3448, "Sarawak Digital Economy Corporation and founder programmes.", "kuching-sdec"],
  ["kch-sains", "SAINS", "https://www.sains.com.my", "Enterprise", "Kuching, Sarawak", 1.5535, 110.3448, "Sarawak Information Systems, the state’s digital services group.", "kuching-sdec"],
  ["kch-spay", "S Pay Global", "https://www.spayglobal.my", "FinTech", "Kuching, Sarawak", 1.5538, 110.3452, "Sarawak’s digital payments scheme.", "kuching-sdec"],
  ["kch-sacofa", "Sacofa", "https://www.sacofa.com.my", "Telecom", "Kuching, Sarawak", 1.5486, 110.3442, "State fibre and connectivity company."],
  ["kch-sarawak-energy", "Sarawak Energy digital", "https://www.sarawakenergy.com", "Energy", "Kuching, Sarawak", 1.5572, 110.3518, "Utility digital customer and grid systems."],
  ["kch-unimas", "UNIMAS Innovation", "https://www.unimas.my", "Hub", "Kota Samarahan, Sarawak", 1.4688, 110.4296, "University commercialisation next to Kuching."],
  ["kch-swinburne", "Swinburne Sarawak", "https://www.swinburne.edu.my", "EdTech", "Kuching, Sarawak", 1.5324, 110.3568, "Campus startup and engineering programmes."],
  ["kch-grab", "Grab Kuching", "https://www.grab.com", "Superapp", "Kuching, Sarawak", 1.5533, 110.3592, "City operations."],
  ["kch-shopee", "Shopee Kuching", "https://shopee.com.my", "Marketplace", "Kuching, Sarawak", 1.5488, 110.3524, "E-commerce ops for Sarawak."],
  ["kch-foodpanda", "foodpanda Kuching", "https://www.foodpanda.my", "Logistics", "Kuching, Sarawak", 1.5564, 110.3446, "Delivery network."],
  ["kch-tng", "Touch 'n Go Kuching", "https://www.touchngo.com.my", "FinTech", "Kuching, Sarawak", 1.5542, 110.3512, "Merchant wallet presence."],
  ["kch-storehub", "StoreHub Kuching", "https://www.storehub.com", "SaaS", "Kuching waterfront, Sarawak", 1.5608, 110.3472, "Cloud POS for Kuching F&B."],
  ["kch-ninjavan", "Ninja Van Kuching", "https://www.ninjavan.co", "Logistics", "Kuching, Sarawak", 1.5412, 110.3386, "Last-mile hub."],
  ["kch-easyparcel", "EasyParcel Kuching", "https://www.easyparcel.com", "Logistics", "Kuching, Sarawak", 1.5524, 110.3488, "Parcel aggregator."],
  ["kch-boost", "Boost Kuching", "https://www.myboost.com.my", "FinTech", "Kuching, Sarawak", 1.5536, 110.3534, "e-wallet acquiring."],
  ["kch-ghl", "GHL Kuching", "https://www.ghl.com", "FinTech", "Kuching, Sarawak", 1.5548, 110.3504, "Merchant acquiring."],
  ["kch-carsome", "Carsome Kuching", "https://www.carsome.my", "Marketplace", "Kuching, Sarawak", 1.5386, 110.3624, "Used-car inspection centre."],
  ["kch-cenex", "CENTEXS", "https://www.centexs.edu.my", "Hub", "Kuching, Sarawak", 1.5296, 110.3442, "Technical excellence centre feeding digital skills."],
  ["kch-ipay88", "iPay88 Kuching", "https://www.ipay88.com", "FinTech", "Kuching, Sarawak", 1.5552, 110.3496, "Payment gateway onboarding."],
  ["kch-lalamove", "Lalamove Kuching", "https://www.lalamove.com", "Logistics", "Kuching, Sarawak", 1.5518, 110.3548, "On-demand delivery."],
];

const kotaKinabalu = [
  ["kk-ums", "UMS Innovation", "https://www.ums.edu.my", "Hub", "Kota Kinabalu, Sabah", 6.0364, 116.1188, "Universiti Malaysia Sabah commercialisation and marine-tech spinouts."],
  ["kk-sabah-net", "Sabah Net", "https://www.sabah.gov.my", "Telecom", "Kota Kinabalu, Sabah", 5.9804, 116.0735, "State digital infrastructure programmes."],
  ["kk-tourism", "Sabah Tourism digital", "https://www.sabahtourism.com", "Travel", "Kota Kinabalu, Sabah", 5.9832, 116.0762, "Destination platform for Sabah travel."],
  ["kk-grab", "Grab Kota Kinabalu", "https://www.grab.com", "Superapp", "Kota Kinabalu, Sabah", 5.9788, 116.0724, "City operations."],
  ["kk-shopee", "Shopee Kota Kinabalu", "https://shopee.com.my", "Marketplace", "Kota Kinabalu, Sabah", 5.9816, 116.0758, "E-commerce ops for Sabah."],
  ["kk-foodpanda", "foodpanda Kota Kinabalu", "https://www.foodpanda.my", "Logistics", "Kota Kinabalu, Sabah", 5.9796, 116.0784, "Delivery network."],
  ["kk-tng", "Touch 'n Go Kota Kinabalu", "https://www.touchngo.com.my", "FinTech", "Kota Kinabalu, Sabah", 5.9808, 116.0742, "Merchant wallet presence."],
  ["kk-storehub", "StoreHub Kota Kinabalu", "https://www.storehub.com", "SaaS", "Gaya Street precinct, Kota Kinabalu", 5.9836, 116.0768, "Cloud POS for KK F&B and tourism retail."],
  ["kk-ninjavan", "Ninja Van Kota Kinabalu", "https://www.ninjavan.co", "Logistics", "Kota Kinabalu, Sabah", 5.9684, 116.0682, "Last-mile hub."],
  ["kk-easyparcel", "EasyParcel Kota Kinabalu", "https://www.easyparcel.com", "Logistics", "Kota Kinabalu, Sabah", 5.9812, 116.0738, "Parcel aggregator."],
  ["kk-boost", "Boost Kota Kinabalu", "https://www.myboost.com.my", "FinTech", "Kota Kinabalu, Sabah", 5.9792, 116.0752, "e-wallet acquiring."],
  ["kk-carsome", "Carsome Kota Kinabalu", "https://www.carsome.my", "Marketplace", "Kota Kinabalu, Sabah", 5.9628, 116.0824, "Used-car inspection centre."],
  ["kk-ghl", "GHL Kota Kinabalu", "https://www.ghl.com", "FinTech", "Kota Kinabalu, Sabah", 5.9806, 116.0748, "Merchant acquiring."],
  ["kk-ipay88", "iPay88 Kota Kinabalu", "https://www.ipay88.com", "FinTech", "Kota Kinabalu, Sabah", 5.9818, 116.0732, "Payment gateway onboarding."],
  ["kk-lalamove", "Lalamove Kota Kinabalu", "https://www.lalamove.com", "Logistics", "Kota Kinabalu, Sabah", 5.9774, 116.0716, "On-demand delivery."],
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

writeCity("johor-bahru", johorBahru);
writeCity("malacca", malacca);
writeCity("klang-valley", klangValley);
writeCity("ipoh", ipoh);
writeCity("penang", penang);
writeCity("kuantan", kuantan);
writeCity("kuching", kuching);
writeCity("kota-kinabalu", kotaKinabalu);
mergeBuildings();
console.log("malaysia seeds written");
