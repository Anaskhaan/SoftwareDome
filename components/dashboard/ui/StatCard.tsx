import React from "react";
import { Card } from "./Card";

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  loading = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-surface-sunken" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-surface-sunken" />
            <div className="h-5 w-14 animate-pulse rounded bg-surface-sunken" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green/30 hover:shadow-[0_16px_36px_-18px_rgba(95,194,74,0.3)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-dark transition-colors group-hover:bg-brand-green group-hover:text-white">
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-brand text-2xl font-bold text-primary-navy">{value}</h3>
            {trend && (
              <span
                className={`text-xs font-bold ${trend.positive ? "text-status-success" : "text-status-danger"}`}
              >
                {trend.positive ? "▲" : "▼"} {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
