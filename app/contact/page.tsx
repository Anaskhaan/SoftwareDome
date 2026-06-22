"use client";

import { useState } from "react";
import StaticPage from "@/components/legal/StaticPage";
import { submitContactForm } from "./actions";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      const result = await submitContactForm(formData);
      if (result.success) {
        setStatus({ type: "success", text: "Thanks! We'll get back to you within 1-2 business days." });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", text: result.error || "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaticPage
      eyebrow="Company"
      title="Contact Us"
      description="Have a question, partnership idea, or feedback? We'd love to hear from you."
    >
      {status && (
        <div
          className={`mb-6 rounded-lg p-3 text-sm font-semibold ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold uppercase text-zinc-500">Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold uppercase text-zinc-500">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-navy px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-accent-blue disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </StaticPage>
  );
}
