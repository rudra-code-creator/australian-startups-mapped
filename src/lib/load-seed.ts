import type { Building, CitySlug, Startup } from "./types";
import { enrichStartupPresentation } from "./branding";
import { linkedMapSlugs } from "./cities";
import buildings from "@/data/buildings.json";
import brisbane from "@/data/startups/brisbane.json";
import sydney from "@/data/startups/sydney.json";
import melbourne from "@/data/startups/melbourne.json";
import adelaide from "@/data/startups/adelaide.json";
import perth from "@/data/startups/perth.json";
import auckland from "@/data/startups/auckland.json";
import wellington from "@/data/startups/wellington.json";
import christchurch from "@/data/startups/christchurch.json";
import portMoresby from "@/data/startups/port-moresby.json";
import suva from "@/data/startups/suva.json";
import nadi from "@/data/startups/nadi.json";
import noumea from "@/data/startups/noumea.json";
import portVila from "@/data/startups/port-vila.json";
import honiara from "@/data/startups/honiara.json";
import jakarta from "@/data/startups/jakarta.json";
import surabaya from "@/data/startups/surabaya.json";
import bandung from "@/data/startups/bandung.json";
import yogyakarta from "@/data/startups/yogyakarta.json";
import denpasar from "@/data/startups/denpasar.json";
import medan from "@/data/startups/medan.json";
import batam from "@/data/startups/batam.json";
import johorBahru from "@/data/startups/johor-bahru.json";
import malacca from "@/data/startups/malacca.json";
import klangValley from "@/data/startups/klang-valley.json";
import ipoh from "@/data/startups/ipoh.json";
import penang from "@/data/startups/penang.json";
import kuantan from "@/data/startups/kuantan.json";
import kuching from "@/data/startups/kuching.json";
import kotaKinabalu from "@/data/startups/kota-kinabalu.json";
import singapore from "@/data/startups/singapore.json";
import delhiNcr from "@/data/startups/delhi-ncr.json";
import mumbai from "@/data/startups/mumbai.json";
import pune from "@/data/startups/pune.json";
import bangalore from "@/data/startups/bangalore.json";
import hyderabad from "@/data/startups/hyderabad.json";
import chennai from "@/data/startups/chennai.json";
import kolkata from "@/data/startups/kolkata.json";
import hongKong from "@/data/startups/hong-kong.json";
import shenzhen from "@/data/startups/shenzhen.json";
import dongguan from "@/data/startups/dongguan.json";
import guangzhou from "@/data/startups/guangzhou.json";
import zhuhai from "@/data/startups/zhuhai.json";

const SEED: Record<CitySlug, Startup[]> = {
  brisbane: brisbane as Startup[],
  sydney: sydney as Startup[],
  melbourne: melbourne as Startup[],
  adelaide: adelaide as Startup[],
  perth: perth as Startup[],
  auckland: auckland as Startup[],
  wellington: wellington as Startup[],
  christchurch: christchurch as Startup[],
  "port-moresby": portMoresby as Startup[],
  suva: suva as Startup[],
  nadi: nadi as Startup[],
  noumea: noumea as Startup[],
  "port-vila": portVila as Startup[],
  honiara: honiara as Startup[],
  jakarta: jakarta as Startup[],
  surabaya: surabaya as Startup[],
  bandung: bandung as Startup[],
  yogyakarta: yogyakarta as Startup[],
  denpasar: denpasar as Startup[],
  medan: medan as Startup[],
  batam: batam as Startup[],
  "johor-bahru": johorBahru as Startup[],
  malacca: malacca as Startup[],
  "klang-valley": klangValley as Startup[],
  ipoh: ipoh as Startup[],
  penang: penang as Startup[],
  kuantan: kuantan as Startup[],
  kuching: kuching as Startup[],
  "kota-kinabalu": kotaKinabalu as Startup[],
  singapore: singapore as Startup[],
  "delhi-ncr": delhiNcr as Startup[],
  mumbai: mumbai as Startup[],
  pune: pune as Startup[],
  bangalore: bangalore as Startup[],
  hyderabad: hyderabad as Startup[],
  chennai: chennai as Startup[],
  kolkata: kolkata as Startup[],
  "hong-kong": hongKong as Startup[],
  shenzhen: shenzhen as Startup[],
  dongguan: dongguan as Startup[],
  guangzhou: guangzhou as Startup[],
  zhuhai: zhuhai as Startup[],
};

export function loadBuildings(): Building[] {
  return buildings as Building[];
}

export function loadSeedStartups(city: CitySlug): Startup[] {
  return (SEED[city] ?? []).map(enrichStartupPresentation);
}

export function loadMapStartups(city: CitySlug): Startup[] {
  return linkedMapSlugs(city).flatMap(loadSeedStartups);
}

export function loadMapBuildings(city: CitySlug): Building[] {
  const slugs = new Set(linkedMapSlugs(city));
  return loadBuildings().filter((building) => slugs.has(building.city));
}
