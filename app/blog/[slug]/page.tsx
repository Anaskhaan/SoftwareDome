"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User } from "@/lib/fa-icons";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

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

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
        <div>
          <Navbar onMenuClick={() => setIsMenuOpen(true)} />
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <div className="w-full px-6 py-12 lg:px-16">
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
          <div className="w-full px-6 py-28 text-center lg:px-16">
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

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Hero Header Section */}
        <header className="w-full bg-zinc-50 border-b border-zinc-200/60 px-6 py-10 lg:px-16 lg:py-16">
          <div className="w-full">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary-navy transition-colors"
              >
                <ArrowLeft size={14} />
                Back to blogs
              </Link>
            </div>

            {/* Tags */}
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

            {/* Title */}
            <h1 className="text-3xl font-black tracking-tight text-primary-navy sm:text-5xl leading-tight max-w-5xl">
              {blog.title}
            </h1>

            {/* Author and Date metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 font-medium">
              <div className="flex items-center gap-2 bg-white border border-zinc-200/50 px-3 py-1.5 rounded-md shadow-sm">
                <span className="font-bold text-primary-navy">
                  By {blog.author?.name || "SoftwareDome Team"}
                </span>
              </div>
              <span className="hidden sm:inline h-4 w-px bg-zinc-300" aria-hidden />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span>Published on</span>
                <span className="font-semibold text-zinc-600">
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="w-full px-6 py-10 lg:px-16">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-10 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 shadow-sm aspect-[21/9] max-h-[500px]">
              <img
                src={blog.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="w-full text-base sm:text-lg leading-relaxed text-zinc-700 whitespace-pre-line space-y-6">
            {blog.content}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
