"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, X, Star, Layers, Sparkles } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { getSoftwares } from "@/app/dashboard/softwares/actions";

export default function SoftwareSection() {
  const [softwares, setSoftwares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getSoftwares();
        if (res.success && res.data) {
          setSoftwares(res.data);
        }
      } catch (err) {
        console.error("Error loading softwares:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute distinct categories dynamically from the loaded software profiles
  const categories = useMemo(() => {
    const list = softwares.map((s) => s.category).filter(Boolean);
    return ["All", ...Array.from(new Set(list))];
  }, [softwares]);

  // Filter software list by chosen tab/category and active search query
  const filteredSoftwares = useMemo(() => {
    return softwares.filter((s) => {
      const matchTab =
        selectedCategory === "All" ||
        s.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const text = searchQuery.toLowerCase().trim();
      const matchSearch =
        !text ||
        s.name?.toLowerCase().includes(text) ||
        s.introduction?.toLowerCase().includes(text) ||
        s.category?.toLowerCase().includes(text);

      return matchTab && matchSearch;
    });
  }, [softwares, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="w-full py-6">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center justify-center text-center">
          <SectionHeader title="Softwares" subtitle="DISCOVER" />
        </div>
        
        {/* Search Input Skeleton */}
        <div className="w-full max-w-md mx-auto mb-10 h-10 bg-slate-100/80 animate-pulse rounded-lg" />
        
        {/* Tabs Skeleton */}
        <div className="flex justify-center gap-2.5 mb-12 max-w-lg mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-24 h-7 bg-slate-100/80 animate-pulse rounded-full" />
          ))}
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200/60 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200/60 rounded w-2/3" />
                    <div className="h-3 bg-slate-200/60 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200/60 rounded" />
                  <div className="h-3 bg-slate-200/60 rounded w-5/6" />
                  <div className="h-3 bg-slate-200/60 rounded w-4/5" />
                </div>
              </div>
              <div className="h-8 bg-slate-200/60 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Title & Section Header */}
      <div className="flex flex-col items-center justify-center text-center">
        <SectionHeader title="Softwares" subtitle="DISCOVER" />
      </div>

      {/* Modern Search Input: Rounded-lg and compact padding */}
      <div className="w-full max-w-md mx-auto mb-8 relative">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search SaaS applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a192f]/10 focus:border-[#0a192f] transition-all"
          />
          <span className="absolute left-3.5 text-slate-400">
            <Search size={16} />
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Category Tabs */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-10 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-all ${
              selectedCategory === cat
                ? "bg-[#0a192f] border-[#0a192f] text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Softwares Cards Grid */}
      {filteredSoftwares.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSoftwares.map((software) => (
            <div
              key={software.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[320px] group relative overflow-hidden"
            >
              {/* Category Tag Badge */}
              {software.category && (
                <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Layers size={10} className="opacity-70" />
                  {software.category}
                </span>
              )}

              <div>
                {/* Logo & Name Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                    {software.logo ? (
                      <img
                        src={software.logo}
                        alt={software.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-xl font-black text-[#0a192f]/30">
                        {software.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0a192f] group-hover:text-blue-900 transition-colors leading-tight">
                      {software.name}
                    </h3>
                    {software.rating > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-extrabold text-slate-700">
                          {software.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description snippet */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {software.introduction ||
                    "Explore detailed system specifications, dynamic benchmarks, FAQs, and thorough verdict reviews on the profile."}
                </p>
              </div>

              {/* Action Buttons footer */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-auto">
                <Link
                  href={`/softwares/${software.slug}`}
                  className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-[#0a192f] font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  Read Review
                </Link>
                {software.website && (
                  <a
                    href={software.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-[#0a192f] hover:bg-[#142d52] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dynamic Sleek Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center">
          <h3 className="text-base font-bold text-[#0a192f] mb-1">No products match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your search terms or picking another category tab to discover awesome softwares.
          </p>
        </div>
      )}
    </div>
  );
}
