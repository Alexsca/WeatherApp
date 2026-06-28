import { useEffect, useMemo, useState } from "react";
import CitySearch from "./components/CitySearch";
import ModeSelector, { type Mode } from "./components/ModeSelector";
import TemperatureChart from "./components/TemperatureChart";
import type { City } from "./data/cities";
import { fetchCityHistory } from "./lib/openMeteo";
import {
  aggregateByYear,
  aggregateByMonth,
  aggregateByDay,
  daysInMonth,
  MONTH_NAMES,
  type DailySeries,
  type YearPoint,
} from "./lib/aggregate";

export default function App() {
  const [city, setCity] = useState<City | null>(null);
  const [daily, setDaily] = useState<DailySeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("year");
  const [month, setMonth] = useState(1); // January
  const [day, setDay] = useState(13); // 13th

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

  const points: YearPoint[] = useMemo(() => {
    if (!daily) return [];
    if (mode === "year") return aggregateByYear(daily);
    if (mode === "month") return aggregateByMonth(daily, month);
    return aggregateByDay(daily, month, safeDay);
  }, [daily, mode, month, safeDay]);

  const latestYear = points.length ? points[points.length - 1].year : undefined;

  const subtitle = useMemo(() => {
    if (mode === "year") return "Average temperature per year";
    if (mode === "month") return `Average temperature in ${MONTH_NAMES[month - 1]}, year by year`;
    return `Temperature on ${safeDay} ${MONTH_NAMES[month - 1]}, year by year`;
  }, [mode, month, safeDay]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Temperature over time</h1>
        <p className="app__tagline">
          See how temperatures have changed across the years. Pick a city, then
          explore by year, month, or a single day.
        </p>
      </header>

      <div className="controls">
        <CitySearch selected={city} onSelect={setCity} />
        <ModeSelector
          mode={mode}
          month={month}
          day={safeDay}
          onModeChange={setMode}
          onMonthChange={setMonth}
          onDayChange={setDay}
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

            {!loading && !error && daily && (
              <>
                <TemperatureChart data={points} highlightYear={latestYear} />
                <p className="panel__legend">
                  <span className="legend-dot legend-dot--latest" /> Latest year
                  ({latestYear}) highlighted · data: ERA5 reanalysis via
                  Open-Meteo
                </p>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
