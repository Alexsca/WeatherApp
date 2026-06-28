import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import type { YearPoint } from "../lib/aggregate";

interface Props {
  data: YearPoint[];
  /** Year to highlight (typically the latest / current year). */
  highlightYear?: number;
  unit?: string;
}

export default function TemperatureChart({ data, highlightYear, unit = "°C" }: Props) {
  if (data.length === 0) {
    return <p className="chart-empty">No data available for this selection.</p>;
  }

  const highlight = data.find((d) => d.year === highlightYear);

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            width={56}
            tickFormatter={(v: number) => `${v}${unit}`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${unit}`, "Temperature"]}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          {highlight && (
            <ReferenceDot
              x={highlight.year}
              y={highlight.temp}
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
              isFront
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
