"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Copy, Layers, XTwitter, LinkedinIcon } from "@/lib/fa-icons";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import RelatedBlogs from "@/components/RelatedBlogs";
import BlogComments from "@/components/BlogComments";
import {
  renderableBlogHtml,
  injectHeadingIds,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/blog-content";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: string[];
  author?: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchBlogDetail() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/blogs/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data.blog || null);
        }
      } catch (err) {
        console.error("Failed to fetch blog details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogDetail();
  }, [slug]);

  const html = useMemo(() => {
    if (!blog) return "";
    return injectHeadingIds(renderableBlogHtml(blog.content));
  }, [blog]);

  const headings = useMemo(() => extractHeadings(html), [html]);
  const readingTime = useMemo(() => (blog ? estimateReadingTime(html) : 0), [blog, html]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
        <div>
          <Navbar onMenuClick={() => setIsMenuOpen(true)} />
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <div className="w-full px-6 pb-12 pt-[120px] lg:px-16 lg:pt-[140px]">
            <div className="h-4 w-24 bg-zinc-200 animate-pulse rounded-md mb-6" />
            <div className="h-10 w-2/3 bg-zinc-200 animate-pulse rounded-md mb-4" />
            <div className="h-64 w-full bg-zinc-200 animate-pulse rounded-md mb-6 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md" />
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-5/6" />
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-4/5" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
        <div>
          <Navbar onMenuClick={() => setIsMenuOpen(true)} />
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <div className="w-full px-6 pb-28 pt-[120px] text-center lg:px-16 lg:pt-[140px]">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
              Not found
            </span>
            <h1 className="mt-3 text-xl font-black text-primary-navy">Article not found</h1>
            <p className="mt-2 text-sm text-zinc-500">
              The article you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-navy hover:underline"
            >
              <ArrowLeft size={14} />
              Back to blogs
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const publishedLabel = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tweetHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Hero Header Section */}
        <header className="w-full bg-zinc-50 border-b border-zinc-200/60 px-6 pb-10 pt-[120px] lg:px-16 lg:pb-16 lg:pt-[140px]">
          <div className="w-full">
            <div className="mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary-navy transition-colors"
              >
                <ArrowLeft size={14} />
                Back to blogs
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-primary-navy sm:text-5xl leading-tight max-w-5xl">
              {blog.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 font-medium">
              <div className="flex items-center gap-2 bg-white border border-zinc-200/50 px-3 py-1.5 rounded-md shadow-sm">
                <span className="font-bold text-primary-navy">
                  By {blog.author?.name || "SoftwareDome Team"}
                </span>
              </div>
              <span className="hidden sm:inline h-4 w-px bg-zinc-300" aria-hidden />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar size={12} />
                <span className="font-semibold text-zinc-600">{publishedLabel}</span>
              </div>
              <span className="hidden sm:inline h-4 w-px bg-zinc-300" aria-hidden />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock size={12} />
                <span className="font-semibold text-zinc-600">{readingTime} min read</span>
              </div>
            </div>

            {/* Share row */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Share</span>
              <a
                href={tweetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
                aria-label="Share on X"
              >
                <XTwitter size={13} />
              </a>
              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
                aria-label="Share on LinkedIn"
              >
                <LinkedinIcon size={13} />
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-[11px] font-bold text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="w-full px-6 py-10 lg:px-16">
          {blog.coverImage && (
            <div className="mb-10 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 shadow-sm aspect-[21/9] max-h-[500px]">
              <img src={blog.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <article
              className="blog-content min-w-0 max-w-none text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <Layers size={13} />
                    On this page
                  </div>
                  <nav className="space-y-2 text-sm">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-zinc-600 hover:text-primary-navy ${
                          heading.level === 3 ? "pl-3 text-xs" : "font-semibold"
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>

          {headings.length > 0 && (
            <div className="mt-6 lg:hidden">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Jump to section
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) window.location.hash = e.target.value;
                }}
                defaultValue=""
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Choose a section…
                </option>
                {headings.map((heading) => (
                  <option key={heading.id} value={heading.id}>
                    {heading.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-16 space-y-16">
            <RelatedBlogs currentId={blog.id} tags={blog.tags} />
            <BlogComments blogSlug={blog.slug} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
