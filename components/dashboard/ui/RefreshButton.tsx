"use client";

import React from "react";
import { RefreshCcw } from "@/lib/fa-icons";

export default function RefreshButton({
  onRefresh,
  className = "",
  label,
}: {
  onRefresh: () => Promise<void> | void;
  className?: string;
  label?: string;
}) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleClick = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={refreshing}
      title="Refresh"
      aria-label="Refresh table data"
      className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-3 text-xs font-bold text-text-muted transition-colors hover:border-brand-green/30 hover:text-primary-navy disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
      {label}
    </button>
  );
}
