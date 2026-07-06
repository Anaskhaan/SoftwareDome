"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Box } from "@/lib/fa-icons";
import { getCategories } from "@/app/dashboard/softwares/actions";

export default function CategoriesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCategories();
      if (res.success) setCategories((res.data as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-zinc-50/60 pb-12 pt-[120px] lg:pt-[140px]">
        <Container>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            All Products
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            Software categories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Browse every admin-verified listing in the SoftwareDome index, grouped by category.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/60" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
              <Box size={28} className="mb-3 text-zinc-300" />
              <h3 className="text-base font-bold text-primary-navy">No categories yet</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                Categories will appear here once softwares are added to the directory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg"
                >
                  <div>
                    <h3 className="text-base font-bold text-primary-navy transition-colors group-hover:text-brand-green-dark">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                      {cat.count} software{cat.count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green-dark transition-colors group-hover:bg-brand-green group-hover:text-white">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </main>
  );
}
