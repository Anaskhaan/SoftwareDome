"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Pagination from "@/components/Pagination";
import { Star, ArrowLeft, Box } from "@/lib/fa-icons";
import { getSoftwaresByCategory } from "@/app/dashboard/softwares/actions";

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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    softwares: any[];
    total: number;
    totalPages: number;
    categoryName: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getSoftwaresByCategory(categorySlug, { page, pageSize: 12 });
      if (!cancelled && res.success) {
        setData(res.data as any);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      router.push(`/categories/${categorySlug}?page=${newPage}`);
    },
    [router, categorySlug]
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-zinc-50/60 py-12">
        <Container>
          <Link
            href="/categories"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-primary-navy"
          >
            <ArrowLeft size={13} />
            All categories
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            Category
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            {loading ? "Loading…" : data?.categoryName || "Category not found"}
          </h1>
          {data && (
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              {data.total} software{data.total === 1 ? "" : "s"} in this category.
            </p>
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/60" />
              ))}
            </div>
          ) : !data || data.softwares.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
              <Box size={28} className="mb-3 text-zinc-300" />
              <h3 className="mb-1 text-base font-bold text-primary-navy">No softwares found</h3>
              <p className="max-w-sm text-xs text-zinc-500">
                We couldn't find any listings for this category. Browse other categories instead.
              </p>
              <Link
                href="/categories"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-green-light px-6 py-2.5 text-sm font-bold text-primary-navy shadow-sm transition-all hover:bg-brand-green hover:text-white"
              >
                Browse categories
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {data.softwares.map((software) => (
                  <Link
                    key={software.id}
                    href={`/softwares/${software.slug}`}
                    className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-lg"
                  >
                    <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                      {software.logo ? (
                        <img src={software.logo} alt={software.name} className="h-full w-full object-contain p-2" />
                      ) : (
                        <span className="text-xl font-black text-primary-navy/25">
                          {software.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-primary-navy transition-colors group-hover:text-brand-green-dark">
                      {software.name}
                    </h3>
                    <div className="mt-2">
                      <StarRating rating={software.rating || 0} />
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination page={page} totalPages={data.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </Container>
      </section>

      <Footer />
    </main>
  );
}
