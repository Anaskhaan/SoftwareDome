"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import CompactSectionHeader from "./CompactSectionHeader";

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

export default function BlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs?limit=3");
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-4">
        <CompactSectionHeader subtitle="Resources" title="Latest from our Blog" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-zinc-200 rounded-md p-4 animate-pulse h-64 bg-slate-50/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <CompactSectionHeader subtitle="Resources" title="Latest from our Blog" />

      {blogs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group bg-white border border-border-subtle rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_16px_36px_-18px_rgba(95,194,74,0.35)] flex flex-col h-full"
              >
                {blog.coverImage ? (
                  <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-slate-50 flex items-center justify-center border-b border-zinc-100">
                    <span className="text-zinc-400 text-xs font-medium">No Cover Image</span>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-brand-green/10 border border-brand-green/20 text-green-800 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-brand text-sm font-bold text-primary-navy group-hover:text-brand-green-dark transition-colors leading-snug mb-2 line-clamp-2">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h3>

                    <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-3">
                      {blog.excerpt || "Read our latest blog article to stay up to date."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto">
                    <span className="text-[10px] text-zinc-600 font-medium">
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
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-xs font-bold text-green-800 hover:text-brand-green flex items-center gap-1"
                    >
                      Read More <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full bg-brand-green-light px-6 py-2.5 text-xs font-bold text-primary-navy shadow-sm transition-all hover:bg-brand-green hover:text-white hover:-translate-y-0.5"
            >
              View All
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-zinc-200 bg-zinc-50/50 rounded-md text-center">
          <h3 className="text-sm font-bold text-[#0a192f] mb-1">No articles published yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Stay tuned! Our writers will publish awesome articles here soon.
          </p>
        </div>
      )}
    </div>
  );
}
