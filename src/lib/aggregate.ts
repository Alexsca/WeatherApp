/**
 * Pure aggregation helpers that turn Open-Meteo's flat daily series into
 * "one point per year" trend data. They take parallel arrays (dates +
 * temperatures, exactly as the API returns them) and have no I/O, so they are
 * trivially unit-testable.
 */

export interface DailySeries {
  /** ISO dates, "YYYY-MM-DD". */
  time: string[];
  /** Daily mean temperature in °C; may contain nulls for missing days. */
  temperature_2m_mean: (number | null)[];
  /** Daily maximum (high) temperature in °C; may contain nulls. */
  temperature_2m_max: (number | null)[];
}

export interface YearPoint {
  year: number;
  /** Aggregated temperature in °C, rounded to 1 decimal. */
  temp: number;
  /** Number of daily values that fed this point (1 for day mode). */
  count: number;
}

export interface CountPoint {
  year: number;
  /** Number of days in the year meeting the threshold. */
  count: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function avg(values: number[]): number {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/** Parse "YYYY-MM-DD" without timezone surprises. */
function parts(iso: string): { year: number; month: number; day: number } {
  return {
    year: Number(iso.slice(0, 4)),
    month: Number(iso.slice(5, 7)),
    day: Number(iso.slice(8, 10)),
  };
}

/**
 * Group daily means by calendar year and average each year.
 */
export function aggregateByYear(daily: DailySeries): YearPoint[] {
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < daily.time.length; i++) {
    const t = daily.temperature_2m_mean[i];
    if (t == null) continue;
    const { year } = parts(daily.time[i]);
    (buckets.get(year) ?? buckets.set(year, []).get(year)!).push(t);
  }
  return toSortedPoints(buckets);
}

/**
 * For the given month (1 = January … 12 = December), average that month's
 * daily means within each year.
 */
export function aggregateByMonth(daily: DailySeries, month: number): YearPoint[] {
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < daily.time.length; i++) {
    const t = daily.temperature_2m_mean[i];
    if (t == null) continue;
    const p = parts(daily.time[i]);
    if (p.month !== month) continue;
    (buckets.get(p.year) ?? buckets.set(p.year, []).get(p.year)!).push(t);
  }
  return toSortedPoints(buckets);
}

/**
 * For the given month + day (e.g. 2, 13 for 13 Feb), take that exact date's
 * mean temperature in each year. Years missing the date (e.g. 29 Feb in
 * non-leap years, or null readings) are skipped.
 */
export function aggregateByDay(daily: DailySeries, month: number, day: number): YearPoint[] {
  const points: YearPoint[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    const t = daily.temperature_2m_mean[i];
    if (t == null) continue;
    const p = parts(daily.time[i]);
    if (p.month !== month || p.day !== day) continue;
    points.push({ year: p.year, temp: round1(t), count: 1 });
  }
  return points.sort((a, b) => a.year - b.year);
}

/**
 * Count, per year, how many days the daily high (temperature_2m_max) reached
 * the threshold or above. Every year present in the data is included (with a
 * count of 0 if no day qualified), so a chart shows the full timeline.
 */
export function countDaysAtOrAbove(daily: DailySeries, threshold: number): CountPoint[] {
  const buckets = new Map<number, number>();
  for (let i = 0; i < daily.time.length; i++) {
    const t = daily.temperature_2m_max[i];
    if (t == null) continue;
    const { year } = parts(daily.time[i]);
    const current = buckets.get(year) ?? 0;
    buckets.set(year, current + (t >= threshold ? 1 : 0));
  }
  return [...buckets.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

/**
 * The rounded min/max of the daily-high series, used to bound the threshold
 * slider. Falls back to a sensible global range when there is no data.
 */
export function maxTempRange(daily: DailySeries): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const t of daily.temperature_2m_max) {
    if (t == null) continue;
    if (t < min) min = t;
    if (t > max) max = t;
  }
  if (min === Infinity) return { min: -10, max: 45 };
  return { min: Math.floor(min), max: Math.ceil(max) };
}

function toSortedPoints(buckets: Map<number, number[]>): YearPoint[] {
  return [...buckets.entries()]
    .map(([year, values]) => ({ year, temp: round1(avg(values)), count: values.length }))
    .sort((a, b) => a.year - b.year);
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Number of days in a month, using a leap year so 29 Feb is always offered. */
export function daysInMonth(month: number): number {
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
