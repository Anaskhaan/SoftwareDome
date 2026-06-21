"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

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

    const delayDebounce = setTimeout(() => {
      loadBlogs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
      <div>
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-20 lg:py-12">
          {/* Header */}
          <div className="mb-8">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
              Resources
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-primary-navy sm:text-4xl">
              SoftwareDome Blog
            </h1>
            <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
              Guides, insights, and latest updates from our editorial team on SaaS and global software trends.
            </p>
          </div>

          {/* Search bar */}
          <div className="mb-10 max-w-md relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-navy/10 focus:border-primary-navy transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search size={16} />
            </span>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-zinc-200 rounded-md p-4 animate-pulse h-80 bg-white"
                />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white border border-zinc-200 rounded-md overflow-hidden hover:border-primary-navy/40 hover:shadow-md transition-all flex flex-col h-full"
                >
                  {blog.coverImage ? (
                    <div className="h-44 w-full relative bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-slate-50 flex items-center justify-center border-b border-zinc-100 shrink-0">
                      <span className="text-zinc-400 text-xs font-medium">No Cover Image</span>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-md text-[9px] font-bold uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="text-base font-extrabold text-[#0a192f] hover:text-blue-900 transition-colors leading-snug mb-2 line-clamp-2">
                        <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h2>

                      <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-3">
                        {blog.excerpt || "Read our latest blog article to stay up to date."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <Calendar size={12} />
                        <span>
                          {blog.publishedAt
                            ? new Date(blog.publishedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : new Date(blog.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                        </span>
                      </div>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-xs font-bold text-primary-navy hover:underline flex items-center gap-0.5"
                      >
                        Read Post <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-zinc-200 bg-white rounded-md text-center">
              <h3 className="text-base font-bold text-[#0a192f] mb-1">No articles found</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Try searching for another keyword or check back later for new updates.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
