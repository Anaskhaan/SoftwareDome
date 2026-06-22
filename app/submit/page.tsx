"use client";

import { useState } from "react";
import StaticPage from "@/components/legal/StaticPage";
import { submitProductForm } from "./actions";

export default function SubmitPage() {
  const [form, setForm] = useState({
    productName: "",
    website: "",
    category: "",
    contactName: "",
    contactEmail: "",
    description: "",
  });
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
      const result = await submitProductForm(formData);
      if (result.success) {
        setStatus({ type: "success", text: "Thanks for the submission! Our team will review it shortly." });
        setForm({ productName: "", website: "", category: "", contactName: "", contactEmail: "", description: "" });
      } else {
        setStatus({ type: "error", text: result.error || "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaticPage
      eyebrow="Directory"
      title="Submit Your Product"
      description="Want your software listed on SoftwareDome? Tell us about it and our team will review your submission."
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
          <label className="text-xs font-bold uppercase text-zinc-500">Product name</label>
          <input
            name="productName"
            value={form.productName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            required
            placeholder="https://"
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold uppercase text-zinc-500">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            placeholder="e.g. CRM, EHR/EMR, Accounting"
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">Your name</label>
          <input
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">Your email</label>
          <input
            type="email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold uppercase text-zinc-500">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="What does your product do, and who is it for?"
            className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm outline-none transition-all focus:border-primary-navy focus:ring-2 focus:ring-primary-navy/20"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-navy px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-accent-blue disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit product"}
          </button>
        </div>
      </form>
    </StaticPage>
  );
}
