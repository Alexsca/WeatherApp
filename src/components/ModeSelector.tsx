import { MONTH_NAMES, daysInMonth } from "../lib/aggregate";

export type Mode = "year" | "month" | "day" | "threshold";

interface Props {
  mode: Mode;
  month: number; // 1-12, used by month & day modes
  day: number; // 1-31, used by day mode
  threshold: number; // °C, used by threshold mode
  thresholdMin: number;
  thresholdMax: number;
  onModeChange: (mode: Mode) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  onThresholdChange: (threshold: number) => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
  { value: "threshold", label: "Hot days" },
];

export default function ModeSelector({
  mode,
  month,
  day,
  threshold,
  thresholdMin,
  thresholdMax,
  onModeChange,
  onMonthChange,
  onDayChange,
  onThresholdChange,
}: Props) {
  return (
    <div className="mode-selector">
      <div className="mode-selector__tabs" role="tablist" aria-label="View mode">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="tab"
            aria-selected={mode === m.value}
            className={"mode-tab" + (mode === m.value ? " is-active" : "")}
            onClick={() => onModeChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {(mode === "month" || mode === "day") && (
        <label className="mode-selector__field">
          Month
          <select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      {mode === "day" && (
        <label className="mode-selector__field">
          Day
          <select
            value={Math.min(day, daysInMonth(month))}
            onChange={(e) => onDayChange(Number(e.target.value))}
          >
            {Array.from({ length: daysInMonth(month) }, (_, i) => i + 1).map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>
        </label>
      )}

      {mode === "threshold" && (
        <label className="mode-selector__field mode-selector__slider">
          <span>
            Temperature: <strong>{threshold}°C</strong> or above
          </span>
          <input
            type="range"
            min={thresholdMin}
            max={thresholdMax}
            step={1}
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            aria-label="Temperature threshold"
          />
        </label>
      )}
    </div>
  );
}
