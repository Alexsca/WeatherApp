import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { CountPoint } from "../lib/aggregate";

interface Props {
  data: CountPoint[];
}

/** Bar chart of how many qualifying days occurred in each year. */
export default function CountChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="chart-empty">No data available for this selection.</p>;
  }

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 12 }} width={42} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(239,68,68,0.08)" }}
            formatter={(value: number) => [`${value} day${value === 1 ? "" : "s"}`, "Days"]}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Bar dataKey="count" fill="#ef4444" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
