"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PALETTE = ["#1d4ed8", "#0891b2", "#7c3aed", "#d97706", "#dc2626", "#059669", "#db2777", "#4b5563"];

export function TrendLineChart({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#98a2b3" />
        <YAxis tick={{ fontSize: 11 }} stroke="#98a2b3" />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  xKey,
  series,
  height = 260,
  layout = "horizontal",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
  layout?: "horizontal" | "vertical";
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 8, right: 12, left: layout === "vertical" ? 40 : -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" />
        {layout === "vertical" ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#98a2b3" />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11 }} stroke="#98a2b3" width={90} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#98a2b3" />
            <YAxis tick={{ fontSize: 11 }} stroke="#98a2b3" />
          </>
        )}
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? PALETTE[i % PALETTE.length]} radius={[4, 4, 4, 4]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({
  data,
  height = 260,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AgePyramid({
  data,
  height = 300,
}: {
  data: { tranche: string; hommes: number; femmes: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }} stackOffset="sign">
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#98a2b3" />
        <YAxis type="category" dataKey="tranche" tick={{ fontSize: 11 }} stroke="#98a2b3" width={50} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => Math.abs(Number(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="hommes" name="Hommes" fill={PALETTE[0]} stackId="p" radius={[4, 0, 0, 4]} />
        <Bar dataKey="femmes" name="Femmes" fill={PALETTE[4]} stackId="p" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
