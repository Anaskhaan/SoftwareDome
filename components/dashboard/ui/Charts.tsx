"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AXIS_TICK = { fontSize: 12, fill: "#5b6b63" };
const GRID_STROKE = "#e7ede6";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-white px-3 py-2 shadow-lg">
      {label && <p className="mb-1 text-xs font-bold text-primary-navy">{label}</p>}
      {payload.map((entry: any) => (
        <p
          key={entry.dataKey ?? entry.name}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: entry.color }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  series,
}: {
  data: Record<string, any>[];
  series: { key: string; label: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} iconType="circle" />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            fill={`url(#fill-${s.key})`}
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: { category: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: "#0a192f", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7faf6" }} />
        <Bar dataKey="count" name="Softwares" fill="#5fc24a" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({
  data,
  colors,
}: {
  data: { status: string; count: number }[];
  colors: Record<string, string>;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.status} fill={colors[d.status] || "#5b6b63"} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-brand text-xl font-bold text-primary-navy">{total}</span>
          <span className="text-[10px] font-bold uppercase text-text-muted">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((d) => (
          <div key={d.status} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-semibold text-primary-navy">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[d.status] || "#5b6b63" }} />
              {d.status}
            </span>
            <span className="font-bold text-text-muted">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
