"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Loader2 } from "@/lib/fa-icons";
import CompactSectionHeader from "@/components/CompactSectionHeader";

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
      <CompactSectionHeader subtitle="From the community" title="User reviews" />

      <div className="space-y-6">
        {user ? (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border-subtle bg-white p-5 sm:p-6">
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
              className="mt-3 w-full resize-y rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-brand-green/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/15"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-text-muted">{content.length}/2000</span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark disabled:translate-y-0 disabled:opacity-60"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {ownReview ? "Update review" : "Post review"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
            {success && <p className="mt-2 text-xs font-medium text-emerald-600">{success}</p>}
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-center">
            <p className="text-sm text-text-muted">
              <Link href="/login" className="font-bold text-primary-navy hover:underline">
                Log in
              </Link>{" "}
              to leave a review about this software.
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-sunken" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <ul className="divide-y divide-border-subtle rounded-3xl border border-border-subtle bg-white">
            {reviews.map((review) => (
              <li key={review.id} className="p-5">
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
                      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">
                        {formatReviewDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && " · edited"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted whitespace-pre-line">
                      {review.content}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-text-muted">
            <MessageSquare size={18} />
            <p className="text-xs leading-relaxed">No reviews yet. Be the first to share your thoughts.</p>
          </div>
        )}
      </div>
    </section>
  );
}