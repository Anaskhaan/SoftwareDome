import React from "react";

export function Card({
  className = "",
  children,
  noPadding = false,
}: {
  className?: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-white shadow-[0_1px_2px_0_rgba(10,25,47,0.05)] ${
        noPadding ? "" : "p-5 sm:p-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-brand text-base font-bold text-primary-navy sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
