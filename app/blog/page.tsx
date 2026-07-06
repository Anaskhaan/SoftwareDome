"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight, FileText } from "@/lib/fa-icons";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: string[];
}

const HERO_GRADIENT = {
  background:
    "linear-gradient(120deg, var(--navy-800) 0%, var(--navy-700) 45%, var(--green-700) 100%)",
};

export default function BlogAllPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadBlogs() {
      try {
        const query = search ? `&search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/blogs?limit=50${query}`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs || []);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadBlogs, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main className="min-h-screen bg-surface-muted">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pb-20 pt-[120px] text-center lg:pt-[140px]"
        style={HERO_GRADIENT}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-16 h-[480px] w-[480px] rounded-full bg-white/[0.03]"
            style={{ filter: "blur(100px)" }}
          />
          <div
            className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-black/20"
            style={{ filter: "blur(70px)" }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <Container className="relative z-10">
          <h1 className="mx-auto mt-3 max-w-5xl font-brand text-5xl font-bold leading-tight text-white md:text-[60px]">
            SoftwareDome Resource Center
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-white/45">
            Guides, insights, and software trends from our editorial team.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-10 max-w-xl">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white py-4 pl-11 pr-5 text-sm text-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.18)] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Articles grid ────────────────────────────────────────────── */}
      <section className="pb-24 pt-12">
        <Container>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(10,25,47,0.15)]"
                >
                  {/* Cover */}
                  <Link href={`/blog/${blog.slug}`} className="block shrink-0">
                    {blog.coverImage ? (
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-48 w-full items-center justify-center"
                        style={HERO_GRADIENT}
                      >
                        <FileText size={32} className="text-white/30" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    {/* Tags */}
                    {blog.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="mb-2 line-clamp-2 font-brand text-[15px] font-bold leading-snug text-navy-800 transition-colors group-hover:text-brand-green-dark">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-text-muted">
                      {blog.excerpt ||
                        "Read our latest article to stay up to date with software trends."}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <Calendar size={11} />
                        <span>
                          {new Date(
                            blog.publishedAt || blog.createdAt,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-green-dark transition-colors hover:text-brand-green"
                      >
                        Read Post
                        <ArrowRight
                          size={11}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-white px-6 py-24 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={HERO_GRADIENT}
              >
                <Search size={22} className="text-white/70" />
              </div>
              <h3 className="font-brand text-lg font-bold text-navy-800">
                No articles found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-text-muted">
                Try a different keyword or check back later for new updates.
              </p>
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </main>
  );
}
