"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, FileText } from "@/lib/fa-icons";

type RelatedBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: string[];
};

export default function RelatedBlogs({ currentId, tags }: { currentId: string; tags: string[] }) {
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const seenIds = new Set([currentId]);
      let combined: RelatedBlog[] = [];

      for (const tag of tags.slice(0, 2)) {
        if (combined.length >= 3) break;
        try {
          const res = await fetch(`/api/blogs?tag=${encodeURIComponent(tag)}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            for (const blog of (data.blogs || []) as RelatedBlog[]) {
              if (!seenIds.has(blog.id) && combined.length < 3) {
                combined = [...combined, blog];
                seenIds.add(blog.id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load tag-related blogs:", err);
        }
      }

      if (combined.length < 3) {
        try {
          const res = await fetch(`/api/blogs?limit=${3 + seenIds.size}`);
          if (res.ok) {
            const data = await res.json();
            for (const blog of (data.blogs || []) as RelatedBlog[]) {
              if (!seenIds.has(blog.id) && combined.length < 3) {
                combined = [...combined, blog];
                seenIds.add(blog.id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load recent fallback blogs:", err);
        }
      }

      if (!cancelled) {
        setRelated(combined);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentId, tags]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="border-t border-border-subtle pt-10">
      <h2 className="mb-6 font-brand text-xl font-bold text-primary-navy">Related articles</h2>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {related.map((blog) => (
            <article
              key={blog.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(10,25,47,0.15)]"
            >
              <Link href={`/blog/${blog.slug}`} className="block shrink-0">
                {blog.coverImage ? (
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-muted">
                    <FileText size={24} className="text-primary-navy/20" />
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 line-clamp-2 font-brand text-sm font-bold leading-snug text-navy-800 transition-colors group-hover:text-brand-green-dark">
                  <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h3>
                <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-text-muted">
                  {blog.excerpt || "Read our latest article to stay up to date."}
                </p>
                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Calendar size={11} />
                    <span>
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green-dark transition-colors hover:text-brand-green"
                  >
                    Read
                    <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
