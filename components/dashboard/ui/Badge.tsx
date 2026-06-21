import React from "react";
import type { StatusTone } from "@/lib/design-tokens";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  danger: "bg-status-danger-bg text-status-danger",
  info: "bg-status-info-bg text-status-info",
  neutral: "bg-surface-sunken text-text-muted",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

/** Maps common status strings to a tone — extend as new statuses appear. */
export function statusToTone(status: string | undefined | null): StatusTone {
  const s = (status || "").toLowerCase();
  if (["active", "verified", "published", "approved"].includes(s)) return "success";
  if (["pending", "draft", "review"].includes(s)) return "warning";
  if (["suspended", "rejected", "inactive", "banned"].includes(s)) return "danger";
  if (["invited"].includes(s)) return "info";
  return "neutral";
}
