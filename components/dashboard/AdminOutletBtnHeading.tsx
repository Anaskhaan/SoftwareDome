import React from "react";
import Link from "next/link";
import { Plus } from "@/lib/fa-icons";

interface AdminOutletBtnHeadingProps {
  heading: string;
  subtitle?: string;
  btnText: string;
  btnUrl: string;
}

export default function AdminOutletBtnHeading({
  heading,
  subtitle,
  btnText,
  btnUrl,
}: AdminOutletBtnHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-brand text-2xl font-bold text-primary-navy sm:text-3xl">{heading}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-text-muted">{subtitle}</p>}
      </div>
      <Link
        href={btnUrl}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] transition-all hover:bg-brand-green-dark hover:-translate-y-0.5"
      >
        <Plus size={16} /> {btnText}
      </Link>
    </div>
  );
}
