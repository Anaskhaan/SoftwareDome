"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Loader2 } from "@/lib/fa-icons";

type ReviewUser = {
  id: string;
  name: string | null;
  image: string | null;
};

type Review = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
};

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
};

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
      {children}
    </span>
  );
}

export default function SoftwareReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ownReview = user ? reviews.find((r) => r.user.id === user.id) : null;

  useEffect(() => {
    async function load() {
      try {
        const [reviewsRes, meRes] = await Promise.all([
          fetch(`/api/softwares/${slug}/reviews`),
          fetch("/api/auth/me"),
        ]);

        let fetchedReviews: Review[] = [];
        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          fetchedReviews = data.reviews || [];
          setReviews(fetchedReviews);
        }

        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
          const existing = fetchedReviews.find((r) => r.user.id === data.user.id);
          if (existing) {
            setContent(existing.content);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please write your review before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/softwares/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review.");
        return;
      }

      setReviews((prev) => {
        const withoutOwn = prev.filter((r) => r.user.id !== data.review.user.id);
        return [data.review, ...withoutOwn];
      });
      setSuccess(ownReview ? "Review updated." : "Review posted.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
          <SectionLabel>User reviews</SectionLabel>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="review-content" className="block text-sm font-bold text-primary-navy">
                {ownReview ? "Update your review" : "Share your experience"}
              </label>
              <textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you think about this software?"
                rows={4}
                maxLength={2000}
                className="w-full resize-y rounded-sm border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-primary-navy/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-navy/10"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">{content.length}/2000</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary-navy px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-blue disabled:opacity-60"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {ownReview ? "Update review" : "Post review"}
                </button>
              </div>
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              {success && <p className="text-xs font-medium text-emerald-600">{success}</p>}
            </form>
          ) : (
            <div className="rounded-sm border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-4 text-center">
              <p className="text-sm text-zinc-600">
                <Link href="/login" className="font-bold text-primary-navy hover:underline">
                  Log in
                </Link>{" "}
                to leave a review about this software.
              </p>
            </div>
          )}

          <div className="border-t border-zinc-100 pt-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-sm bg-zinc-100" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <ul className="divide-y divide-zinc-100">
                {reviews.map((review) => (
                  <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-navy/10 text-xs font-bold text-primary-navy">
                        {review.user.image ? (
                          <img
                            src={review.user.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (review.user.name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-sm font-bold text-primary-navy">
                            {review.user.name || "Anonymous user"}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                            {formatReviewDate(review.createdAt)}
                            {review.updatedAt !== review.createdAt && " · edited"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
                          {review.content}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 text-zinc-400">
                <MessageSquare size={18} />
                <p className="text-xs leading-relaxed">No reviews yet. Be the first to share your thoughts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}