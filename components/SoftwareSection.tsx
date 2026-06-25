"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Settings,
  CircleUser,
} from "@/lib/fa-icons";
import { getSoftwares } from "@/app/dashboard/softwares/actions";

const staticCategories = [
  { label: "LMS Software", icon: GraduationCap, match: "lms" },
  { label: "EMR Software", icon: HeartPulse, match: "emr" },
  { label: "Project Management", icon: Lightbulb, match: "project" },
  { label: "CRM Software", icon: Settings, match: "crm" },
  { label: "Human Resources", icon: CircleUser, match: "hr" },
];

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rounded ? "text-orange-400 fill-orange-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  );
}

function defaultIndex(data: any[]) {
  const idx = staticCategories.findIndex((cat) =>
    data.some((s: any) => s.category?.toLowerCase().includes(cat.match))
  );
  return idx > -1 ? idx : 0;
}

export default function SoftwareSection({ initialData }: { initialData?: any[] } = {}) {
  const [softwares, setSoftwares] = useState<any[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [activeIndex, setActiveIndex] = useState(() =>
    initialData ? defaultIndex(initialData) : 0
  );
  const [showAllCategories, setShowAllCategories] = useState(() =>
    initialData ? defaultIndex(initialData) >= 2 : false
  );

  useEffect(() => {
    if (initialData) return;
    async function fetchData() {
      try {
        const res = await getSoftwares();
        if (res.success && res.data) {
          setSoftwares(res.data);
          const firstMatchIndex = defaultIndex(res.data);
          setActiveIndex(firstMatchIndex);
          if (firstMatchIndex >= 2) setShowAllCategories(true);
        }
      } catch (err) {
        console.error("Error loading softwares:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeCategory = staticCategories[activeIndex];

  const filteredSoftwares = useMemo(() => {
    return softwares
      .filter((s) => s.category?.toLowerCase().includes(activeCategory.match))
      .slice(0, 10);
  }, [softwares, activeCategory]);

  if (loading) {
    return (
      <div className="w-full py-6 text-center">
        <div className="mx-auto mb-3 h-9 w-96 max-w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="mx-auto mb-10 h-4 w-72 animate-pulse rounded bg-slate-100" />
        <div className="mx-auto mb-10 h-14 max-w-3xl animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 text-center">
      <h2 className="font-brand text-3xl font-bold leading-tight text-primary-navy sm:text-4xl">
        Choose from {Math.max(softwares.length, 100)}+ Software Options
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
        Here are our top picks from our most popular categories:
      </p>

      {/* Static category bar — only 2 shown by default on mobile, pill row from sm up */}
      <div className="mx-auto mt-10 mb-10">
        <div className="mx-auto grid max-w-full grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:inline-flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-1 sm:p-1.5">
          {staticCategories.map((cat, i) => {
            const Icon = cat.icon;
            const isActive = i === activeIndex;
            const isLastOdd = i === staticCategories.length - 1 && staticCategories.length % 2 === 1;
            const hiddenOnMobile = i >= 2 && !showAllCategories;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveIndex(i)}
                className={`items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:flex sm:px-4 sm:text-sm ${
                  hiddenOnMobile ? "hidden" : "flex"
                } ${isLastOdd ? "col-span-2" : ""} ${
                  isActive
                    ? "bg-primary-navy text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary-navy"
                }`}
              >
                <Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {staticCategories.length > 2 && (
          <button
            onClick={() => setShowAllCategories((v) => !v)}
            className="mt-3 inline-flex items-center text-xs font-bold text-green-800 hover:text-brand-green sm:hidden"
          >
            {showAllCategories ? "Show fewer categories" : "Show all categories"}
          </button>
        )}
      </div>

      {/* Compact product grid — 2 cols x 5 rows on mobile */}
      {filteredSoftwares.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {filteredSoftwares.map((software) => (
            <Link
              key={software.id}
              href={`/softwares/${software.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg"
            >
              <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50 border border-slate-100">
                {software.logo ? (
                  <img src={software.logo} alt={software.name} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xl font-black text-primary-navy/25">
                    {software.name?.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-primary-navy group-hover:text-brand-green-dark transition-colors">
                {software.name}
              </h3>
              <div className="mt-2">
                <StarRating rating={software.rating || 0} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
          <h3 className="mb-1 text-base font-bold text-primary-navy">
            More {activeCategory.label} listings coming soon
          </h3>
          <p className="max-w-sm text-xs text-zinc-500">
            We're actively curating this category — check back soon or explore another tab above.
          </p>
        </div>
      )}

      <Link
        href="/categories"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-brand-green-light px-8 py-3 text-sm font-bold text-primary-navy shadow-sm transition-all hover:bg-brand-green hover:text-white hover:-translate-y-0.5"
      >
        All Products
      </Link>
    </div>
  );
}
