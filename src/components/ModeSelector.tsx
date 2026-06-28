import { MONTH_NAMES, daysInMonth } from "../lib/aggregate";

export type Mode = "year" | "month" | "day";

interface Props {
  mode: Mode;
  month: number; // 1-12, used by month & day modes
  day: number; // 1-31, used by day mode
  onModeChange: (mode: Mode) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

export default function ModeSelector({
  mode,
  month,
  day,
  onModeChange,
  onMonthChange,
  onDayChange,
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
    </div>
  );
}
