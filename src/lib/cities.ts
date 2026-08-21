import type { CitySlug, CountryId } from "./types";

export const CITY_SLUGS: CitySlug[] = [
  "brisbane",
  "sydney",
  "melbourne",
  "adelaide",
  "perth",
  "auckland",
  "wellington",
  "christchurch",
  "port-moresby",
  "suva",
  "nadi",
  "noumea",
  "port-vila",
  "honiara",
  "jakarta",
  "surabaya",
  "bandung",
  "yogyakarta",
  "denpasar",
  "medan",
  "batam",
  "johor-bahru",
  "malacca",
  "klang-valley",
  "ipoh",
  "penang",
  "kuantan",
  "kuching",
  "kota-kinabalu",
  "singapore",
  "delhi-ncr",
  "mumbai",
  "pune",
  "bangalore",
  "hyderabad",
  "chennai",
  "kolkata",
  "hong-kong",
  "shenzhen",
  "dongguan",
  "guangzhou",
  "zhuhai",
];

export type CityMeta = {
  name: string;
  center: [number, number];
  zoom: number;
  country: CountryId;
  note?: string;
};

const SIJORI_NOTE =
  "Shown together with Singapore, Johor Bahru, and Batam — one cross-border ecosystem";

const GBA_NOTE =
  "Shown together as the Greater Bay Area — Hong Kong, Shenzhen, Dongguan, Guangzhou, and Zhongshan / Zhuhai";

export const CITIES: Record<CitySlug, CityMeta> = {
  brisbane: {
    name: "Brisbane",
    center: [-27.4698, 153.0251],
    zoom: 13,
    country: "australia",
  },
  sydney: {
    name: "Sydney",
    center: [-33.8688, 151.2093],
    zoom: 13,
    country: "australia",
  },
  melbourne: {
    name: "Melbourne",
    center: [-37.8136, 144.9631],
    zoom: 13,
    country: "australia",
  },
  adelaide: {
    name: "Adelaide",
    center: [-34.9285, 138.6007],
    zoom: 13,
    country: "australia",
  },
  perth: {
    name: "Perth",
    center: [-31.9523, 115.8613],
    zoom: 13,
    country: "australia",
  },
  auckland: {
    name: "Auckland",
    center: [-36.8485, 174.7633],
    zoom: 12,
    country: "new-zealand",
  },
  wellington: {
    name: "Wellington",
    center: [-41.2167, 174.877],
    zoom: 11,
    country: "new-zealand",
    note: "Includes Porirua, Lower Hutt, and Upper Hutt",
  },
  christchurch: {
    name: "Christchurch",
    center: [-43.5321, 172.6362],
    zoom: 12,
    country: "new-zealand",
  },
  "port-moresby": {
    name: "Port Moresby",
    center: [-9.4438, 147.1803],
    zoom: 12,
    country: "papua-new-guinea",
  },
  suva: {
    name: "Suva",
    center: [-18.1416, 178.4419],
    zoom: 13,
    country: "fiji",
  },
  nadi: {
    name: "Nadi",
    center: [-17.7765, 177.4356],
    zoom: 13,
    country: "fiji",
  },
  noumea: {
    name: "Nouméa",
    center: [-22.2758, 166.458],
    zoom: 13,
    country: "new-caledonia",
  },
  "port-vila": {
    name: "Port Vila",
    center: [-17.7333, 168.327],
    zoom: 13,
    country: "vanuatu",
  },
  honiara: {
    name: "Honiara",
    center: [-9.4456, 159.9729],
    zoom: 13,
    country: "solomon-islands",
  },
  jakarta: {
    name: "Jakarta",
    center: [-6.2088, 106.8456],
    zoom: 12,
    country: "indonesia",
  },
  surabaya: {
    name: "Surabaya",
    center: [-7.2575, 112.7521],
    zoom: 12,
    country: "indonesia",
  },
  bandung: {
    name: "Bandung",
    center: [-6.9175, 107.6191],
    zoom: 12,
    country: "indonesia",
  },
  yogyakarta: {
    name: "Yogyakarta",
    center: [-7.7956, 110.3695],
    zoom: 13,
    country: "indonesia",
  },
  denpasar: {
    name: "Denpasar",
    center: [-8.6705, 115.2126],
    zoom: 12,
    country: "indonesia",
  },
  medan: {
    name: "Medan",
    center: [3.5952, 98.6722],
    zoom: 12,
    country: "indonesia",
  },
  batam: {
    name: "Batam",
    center: [1.1301, 104.053],
    zoom: 12,
    country: "indonesia",
    note: SIJORI_NOTE,
  },
  "johor-bahru": {
    name: "Johor Bahru",
    center: [1.4927, 103.7414],
    zoom: 12,
    country: "malaysia",
    note: SIJORI_NOTE,
  },
  malacca: {
    name: "Malacca",
    center: [2.1896, 102.2501],
    zoom: 13,
    country: "malaysia",
  },
  "klang-valley": {
    name: "Klang Valley",
    center: [2.98, 101.68],
    zoom: 10,
    country: "malaysia",
    note: "Includes Kuala Lumpur, Klang, and Seremban",
  },
  ipoh: {
    name: "Ipoh",
    center: [4.5975, 101.0901],
    zoom: 13,
    country: "malaysia",
  },
  penang: {
    name: "Penang",
    center: [5.354, 100.301],
    zoom: 12,
    country: "malaysia",
  },
  kuantan: {
    name: "Kuantan",
    center: [3.8077, 103.326],
    zoom: 13,
    country: "malaysia",
  },
  kuching: {
    name: "Kuching",
    center: [1.5533, 110.3592],
    zoom: 13,
    country: "malaysia",
  },
  "kota-kinabalu": {
    name: "Kota Kinabalu",
    center: [5.9804, 116.0735],
    zoom: 13,
    country: "malaysia",
  },
  singapore: {
    name: "Singapore",
    center: [1.2966, 103.8218],
    zoom: 12,
    country: "singapore",
    note: SIJORI_NOTE,
  },
  "delhi-ncr": {
    name: "Delhi-NCR",
    center: [28.5355, 77.291],
    zoom: 11,
    country: "india",
    note: "Includes Delhi, Gurgaon / Gurugram, and Noida",
  },
  mumbai: {
    name: "Mumbai",
    center: [19.076, 72.8777],
    zoom: 12,
    country: "india",
  },
  pune: {
    name: "Pune",
    center: [18.5204, 73.8567],
    zoom: 12,
    country: "india",
  },
  bangalore: {
    name: "Bangalore",
    center: [12.9716, 77.5946],
    zoom: 12,
    country: "india",
  },
  hyderabad: {
    name: "Hyderabad",
    center: [17.385, 78.4867],
    zoom: 12,
    country: "india",
  },
  chennai: {
    name: "Chennai",
    center: [13.0827, 80.2707],
    zoom: 12,
    country: "india",
  },
  kolkata: {
    name: "Kolkata",
    center: [22.5726, 88.3639],
    zoom: 12,
    country: "india",
  },
  "hong-kong": {
    name: "Hong Kong",
    center: [22.3193, 114.1694],
    zoom: 12,
    country: "greater-bay-area",
    note: GBA_NOTE,
  },
  shenzhen: {
    name: "Shenzhen",
    center: [22.5431, 114.0579],
    zoom: 12,
    country: "greater-bay-area",
    note: GBA_NOTE,
  },
  dongguan: {
    name: "Dongguan",
    center: [23.0207, 113.7518],
    zoom: 12,
    country: "greater-bay-area",
    note: GBA_NOTE,
  },
  guangzhou: {
    name: "Guangzhou",
    center: [23.1291, 113.2644],
    zoom: 12,
    country: "greater-bay-area",
    note: GBA_NOTE,
  },
  zhuhai: {
    name: "Zhongshan / Zhuhai",
    center: [22.35, 113.5],
    zoom: 11,
    country: "greater-bay-area",
    note: GBA_NOTE,
  },
};

/** Singapore, Johor Bahru, and Batam are one commuting / supply-chain ecosystem. */
export const SIJORI_CITY_SLUGS: CitySlug[] = [
  "singapore",
  "johor-bahru",
  "batam",
];

/** Guangdong–Hong Kong–Macao Greater Bay Area tech corridor. */
export const GBA_CITY_SLUGS: CitySlug[] = [
  "hong-kong",
  "shenzhen",
  "dongguan",
  "guangzhou",
  "zhuhai",
];

const SIJORI_VIEW = {
  center: [1.3, 103.9] as [number, number],
  zoom: 10,
};

const GBA_VIEW = {
  center: [22.7, 113.8] as [number, number],
  zoom: 9,
};

export const COUNTRIES: { id: CountryId; name: string; citySlugs: CitySlug[] }[] =
  [
    {
      id: "australia",
      name: "Australia",
      citySlugs: ["brisbane", "sydney", "melbourne", "adelaide", "perth"],
    },
    {
      id: "new-zealand",
      name: "New Zealand",
      citySlugs: ["auckland", "wellington", "christchurch"],
    },
    {
      id: "papua-new-guinea",
      name: "Papua New Guinea",
      citySlugs: ["port-moresby"],
    },
    {
      id: "fiji",
      name: "Fiji",
      citySlugs: ["suva", "nadi"],
    },
    {
      id: "new-caledonia",
      name: "New Caledonia",
      citySlugs: ["noumea"],
    },
    {
      id: "vanuatu",
      name: "Vanuatu",
      citySlugs: ["port-vila"],
    },
    {
      id: "solomon-islands",
      name: "Solomon Islands",
      citySlugs: ["honiara"],
    },
    {
      id: "indonesia",
      name: "Indonesia",
      citySlugs: [
        "jakarta",
        "surabaya",
        "bandung",
        "yogyakarta",
        "denpasar",
        "medan",
        "batam",
      ],
    },
    {
      id: "malaysia",
      name: "Malaysia",
      citySlugs: [
        "johor-bahru",
        "malacca",
        "klang-valley",
        "ipoh",
        "penang",
        "kuantan",
        "kuching",
        "kota-kinabalu",
      ],
    },
    {
      id: "singapore",
      name: "Singapore",
      citySlugs: ["singapore"],
    },
    {
      id: "india",
      name: "India",
      citySlugs: [
        "delhi-ncr",
        "mumbai",
        "pune",
        "bangalore",
        "hyderabad",
        "chennai",
        "kolkata",
      ],
    },
    {
      id: "greater-bay-area",
      name: "Greater Bay Area",
      citySlugs: [
        "hong-kong",
        "shenzhen",
        "dongguan",
        "guangzhou",
        "zhuhai",
      ],
    },
  ];

export function linkedMapSlugs(city: CitySlug): CitySlug[] {
  if (SIJORI_CITY_SLUGS.includes(city)) return [...SIJORI_CITY_SLUGS];
  if (GBA_CITY_SLUGS.includes(city)) return [...GBA_CITY_SLUGS];
  return [city];
}

export function mapViewport(city: CitySlug): {
  center: [number, number];
  zoom: number;
} {
  if (SIJORI_CITY_SLUGS.includes(city)) return SIJORI_VIEW;
  if (GBA_CITY_SLUGS.includes(city)) return GBA_VIEW;
  return { center: CITIES[city].center, zoom: CITIES[city].zoom };
}

export function chromeSiblings(city: CitySlug): CitySlug[] {
  if (SIJORI_CITY_SLUGS.includes(city)) return [...SIJORI_CITY_SLUGS];
  if (GBA_CITY_SLUGS.includes(city)) return [...GBA_CITY_SLUGS];
  const country = COUNTRIES.find((item) => item.citySlugs.includes(city));
  return country?.citySlugs ?? [city];
}

export function chromeRegionLabel(city: CitySlug): string {
  if (SIJORI_CITY_SLUGS.includes(city)) return "Singapore–Johor–Batam";
  if (GBA_CITY_SLUGS.includes(city)) return "Greater Bay Area";
  return COUNTRIES.find((item) => item.citySlugs.includes(city))?.name ?? "City";
}

/** Smaller Pacific and secondary maps are thinner by ecosystem size. */
export function minSeedCount(city: CitySlug): number {
  switch (city) {
    case "honiara":
    case "port-vila":
    case "kuantan":
    case "dongguan":
    case "zhuhai":
      return 12;
    case "noumea":
    case "nadi":
    case "malacca":
    case "ipoh":
    case "kota-kinabalu":
    case "kolkata":
      return 15;
    case "suva":
    case "port-moresby":
    case "batam":
    case "kuching":
    case "chennai":
    case "pune":
      return 20;
    case "medan":
    case "yogyakarta":
    case "johor-bahru":
    case "hyderabad":
    case "guangzhou":
    case "hong-kong":
      return 25;
    case "surabaya":
    case "denpasar":
    case "christchurch":
    case "penang":
    case "shenzhen":
      return 30;
    case "brisbane":
    case "sydney":
    case "melbourne":
    case "adelaide":
    case "perth":
    case "auckland":
    case "wellington":
    case "jakarta":
    case "bandung":
    case "singapore":
    case "klang-valley":
    case "delhi-ncr":
    case "mumbai":
    case "bangalore":
      return 40;
    default: {
      const _exhaustive: never = city;
      return _exhaustive;
    }
  }
}

export function isCitySlug(value: string): value is CitySlug {
  return (CITY_SLUGS as string[]).includes(value);
}
