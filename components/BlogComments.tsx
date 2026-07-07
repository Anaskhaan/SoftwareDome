"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "@/lib/fa-icons";
import CompactSectionHeader from "@/components/CompactSectionHeader";
import Button from "@/components/Button";

type CommentUser = { id: string; name: string | null; image: string | null };

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
};

type AuthUser = { id: string; name: string | null; email: string; role: string };

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogComments({ blogSlug }: { blogSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [commentsRes, meRes] = await Promise.all([
          fetch(`/api/blogs/slug/${blogSlug}/comments`),
          fetch("/api/auth/me"),
        ]);

        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data.comments || []);
        }

        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [blogSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please write a comment before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/slug/${blogSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment.");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setContent("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blogs/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="comments" className="scroll-mt-24">
      <CompactSectionHeader subtitle="Join the discussion" title="Comments" icon={MessageSquare} />

      <div className="space-y-6">
        {user ? (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border-subtle bg-white p-5 sm:p-6">
            <label htmlFor="comment-content" className="block text-sm font-bold text-primary-navy">
              Leave a comment
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts on this article…"
              rows={3}
              maxLength={2000}
              className="mt-3 w-full resize-y rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-brand-green/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/15"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-text-muted">{content.length}/2000</span>
              <Button type="submit" size="sm" loading={submitting}>
                Post comment
              </Button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-center">
            <p className="text-sm text-text-muted">
              <Link href="/login" className="font-bold text-primary-navy hover:underline">
                Log in
              </Link>{" "}
              to join the discussion.
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-sunken" />
            ))}
          </div>
        ) : comments.length > 0 ? (
          <ul className="divide-y divide-border-subtle rounded-3xl border border-border-subtle bg-white">
            {comments.map((comment) => {
              const canDelete = Boolean(user && (user.id === comment.user.id || user.role === "ADMIN"));
              return (
                <li key={comment.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-navy/10 text-xs font-bold text-primary-navy">
                      {comment.user.image ? (
                        <img src={comment.user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (comment.user.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-bold text-primary-navy">
                          {comment.user.name || "Anonymous user"}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-muted whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="shrink-0 rounded-lg p-1.5 text-text-muted/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-text-muted">
            <MessageSquare size={18} />
            <p className="text-xs leading-relaxed">No comments yet. Be the first to share your thoughts.</p>
          </div>
        )}
      </div>
    </section>
  );
}
