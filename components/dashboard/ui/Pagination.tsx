"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "@/lib/fa-icons";

interface PaginationProps {
  page: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
}

export default function Pagination({
  page,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (totalItems === 0) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
        <span>
          Showing <span className="text-primary-navy">{start}–{end}</span> of{" "}
          <span className="text-primary-navy">{totalItems}</span>
        </span>
        {onPerPageChange && (
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-border-subtle bg-surface-muted px-2 py-1 text-xs font-semibold text-primary-navy outline-none focus:border-brand-green"
            aria-label="Rows per page"
          >
            {perPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-colors hover:border-brand-green/30 hover:text-primary-navy disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-2 text-xs font-bold text-primary-navy">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-colors hover:border-brand-green/30 hover:text-primary-navy disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
