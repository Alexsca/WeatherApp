import type { City } from "../data/cities";
import type { DailySeries } from "./aggregate";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const START_DATE = "1950-01-01";
const CACHE_VERSION = "v1";

/** In-memory cache so switching modes never refetches within a session. */
const memoryCache = new Map<string, DailySeries>();

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function cacheKey(city: City): string {
  return `wx:${CACHE_VERSION}:${city.id}`;
}

function readLocalStorage(key: string): DailySeries | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as DailySeries) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, data: DailySeries): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full / unavailable (e.g. private mode) — fall back to memory only.
  }
}

/**
 * Fetch the full daily mean-temperature history for a city (from 1950 to
 * today) in a single request. Results are cached in memory and localStorage,
 * so each city is fetched at most once per browser.
 */
export async function fetchCityHistory(city: City): Promise<DailySeries> {
  const key = cacheKey(city);

  const inMemory = memoryCache.get(key);
  if (inMemory) return inMemory;

  const stored = readLocalStorage(key);
  if (stored) {
    memoryCache.set(key, stored);
    return stored;
  }

  const url = new URL(ARCHIVE_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("start_date", START_DATE);
  url.searchParams.set("end_date", todayISO());
  url.searchParams.set("daily", "temperature_2m_mean");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Weather data request failed (${res.status}). Please try again.`);
  }
  const json = await res.json();
  if (!json?.daily?.time || !json?.daily?.temperature_2m_mean) {
    throw new Error("Weather service returned unexpected data.");
  }

  const data: DailySeries = {
    time: json.daily.time,
    temperature_2m_mean: json.daily.temperature_2m_mean,
  };

  memoryCache.set(key, data);
  writeLocalStorage(key, data);
  return data;
}
