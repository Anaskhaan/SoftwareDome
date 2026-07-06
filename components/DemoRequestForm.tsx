"use client";

import { useState } from "react";
import { submitDemoRequest } from "@/app/dashboard/demo-requests/actions";
import Button from "@/components/Button";

const inputClass =
  "w-full rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-2.5 text-sm outline-none transition-all placeholder-zinc-400 focus:border-brand-green/50 focus:bg-white focus:ring-2 focus:ring-brand-green/15";

export default function DemoRequestForm({
  softwareId,
  softwareName,
  id,
}: {
  softwareId: string;
  softwareName: string;
  id?: string;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("softwareId", softwareId);
      const result = await submitDemoRequest(formData);
      if (result.success) {
        setStatus({ type: "success", text: "Request sent — we'll be in touch shortly." });
        setForm({ name: "", email: "", phone: "", organization: "" });
      } else {
        setStatus({ type: "error", text: result.error || "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={id} className="rounded-3xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_0_rgba(10,25,47,0.04)] sm:p-6">
      <p className="font-brand text-base font-bold leading-snug text-primary-navy">
        Watch a free demo
      </p>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        See {softwareName} in action — no commitment.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          placeholder="Work email"
          value={form.email}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <input
          name="organization"
          placeholder="Organization"
          value={form.organization}
          onChange={handleChange}
          required
          className={inputClass}
        />
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Sending…" : "Request demo"}
        </Button>
        {status && (
          <p
            className={`text-xs font-semibold ${
              status.type === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
}
