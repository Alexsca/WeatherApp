import { useEffect, useMemo, useState } from "react";
import CitySearch from "./components/CitySearch";
import ModeSelector, { type Mode } from "./components/ModeSelector";
import TemperatureChart from "./components/TemperatureChart";
import CountChart from "./components/CountChart";
import type { City } from "./data/cities";
import { fetchCityHistory } from "./lib/openMeteo";
import {
  aggregateByYear,
  aggregateByMonth,
  aggregateByDay,
  countDaysAtOrAbove,
  maxTempRange,
  daysInMonth,
  MONTH_NAMES,
  type DailySeries,
  type YearPoint,
  type CountPoint,
} from "./lib/aggregate";

export default function App() {
  const [city, setCity] = useState<City | null>(null);
  const [daily, setDaily] = useState<DailySeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("year");
  const [month, setMonth] = useState(1); // January
  const [day, setDay] = useState(13); // 13th
  const [threshold, setThreshold] = useState(30); // °C, for "Hot days" mode

  // Fetch (cached) history whenever the city changes.
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDaily(null);
    fetchCityHistory(city)
      .then((data) => {
        if (!cancelled) setDaily(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  // Keep the selected day valid when the month changes (e.g. 31 -> February).
  const safeDay = Math.min(day, daysInMonth(month));

  // Bound the threshold slider to the city's observed range of daily highs.
  const range = useMemo(
    () => (daily ? maxTempRange(daily) : { min: -10, max: 45 }),
    [daily]
  );
  const safeThreshold = Math.max(range.min, Math.min(range.max, threshold));

  const points: YearPoint[] = useMemo(() => {
    if (!daily) return [];
    if (mode === "year") return aggregateByYear(daily);
    if (mode === "month") return aggregateByMonth(daily, month);
    if (mode === "day") return aggregateByDay(daily, month, safeDay);
    return [];
  }, [daily, mode, month, safeDay]);

  const counts: CountPoint[] = useMemo(
    () => (daily && mode === "threshold" ? countDaysAtOrAbove(daily, safeThreshold) : []),
    [daily, mode, safeThreshold]
  );

  // Headline totals for "Hot days": total qualifying days and the per-year mean.
  const totalDays = counts.reduce((sum, c) => sum + c.count, 0);
  const firstYear = counts.length ? counts[0].year : undefined;
  const perYear = counts.length ? (totalDays / counts.length).toFixed(1) : "0";

  const latestYear = points.length ? points[points.length - 1].year : undefined;

  const subtitle = useMemo(() => {
    if (mode === "year") return "Average temperature per year";
    if (mode === "month") return `Average temperature in ${MONTH_NAMES[month - 1]}, year by year`;
    if (mode === "day") return `Temperature on ${safeDay} ${MONTH_NAMES[month - 1]}, year by year`;
    return `Days the high reached ${safeThreshold}°C or above, per year`;
  }, [mode, month, safeDay, safeThreshold]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Temperature over time</h1>
        <p className="app__tagline">
          See how temperatures have changed across the years. Pick a city, then
          explore by year, month, a single day, or count its hot days.
        </p>
      </header>

      <div className="controls">
        <CitySearch selected={city} onSelect={setCity} />
        <ModeSelector
          mode={mode}
          month={month}
          day={safeDay}
          threshold={safeThreshold}
          thresholdMin={range.min}
          thresholdMax={range.max}
          onModeChange={setMode}
          onMonthChange={setMonth}
          onDayChange={setDay}
          onThresholdChange={setThreshold}
        />
      </div>

      <main className="panel">
        {!city && <p className="panel__hint">Search for a city to get started.</p>}

        {city && (
          <>
            <div className="panel__heading">
              <h2>{city.name}</h2>
              <span className="panel__subtitle">{subtitle}</span>
            </div>

            {loading && <p className="panel__hint">Loading {city.name}…</p>}
            {error && <p className="panel__error">{error}</p>}

            {!loading && !error && daily && mode !== "threshold" && (
              <>
                <TemperatureChart data={points} highlightYear={latestYear} />
                <p className="panel__legend">
                  <span className="legend-dot legend-dot--latest" /> Latest year
                  ({latestYear}) highlighted · data: ERA5 reanalysis via
                  Open-Meteo
                </p>
              </>
            )}

            {!loading && !error && daily && mode === "threshold" && (
              <>
                <p className="hotdays-headline">
                  {city.name} has reached{" "}
                  <strong>{safeThreshold}°C or higher</strong> on{" "}
                  <strong>{totalDays.toLocaleString()} days</strong>
                  {firstYear ? ` since ${firstYear}` : ""} — about{" "}
                  <strong>{perYear} days per year</strong>.
                </p>
                <CountChart data={counts} />
                <p className="panel__legend">
                  Counts days whose <em>high</em> reached the threshold · data:
                  ERA5 reanalysis via Open-Meteo
                </p>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
