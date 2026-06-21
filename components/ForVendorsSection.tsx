"use client";

import Link from "next/link";
import CompactSectionHeader from "./CompactSectionHeader";
import { useInView } from "@/hooks/useInView";
import { ArrowRight } from "@/lib/fa-icons";

const lanes = [
  {
    step: "01",
    title: "Build the profile",
    body: "Logo, copy, pros and cons, specs, screenshots, and FAQs — everything buyers will read.",
    href: "/dashboard",
    link: "Dashboard",
  },
  {
    step: "02",
    title: "Admin review",
    body: "Listings are checked for accuracy and completeness before they enter the public index.",
    href: "/submit",
    link: "Submit listing",
  },
  {
    step: "03",
    title: "Go live in catalog",
    body: "Approved software is searchable by category and keyword alongside global competition.",
    href: "#catalog",
    link: "See catalog",
  },
];

const principles = ["No paid ranks", "Human curation", "Global discovery"];

export default function ForVendorsSection() {
  const { ref, visible } = useInView(0.08);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <div
        className={visible ? "landing-rise" : "opacity-0"}
        style={{ animationDelay: "0ms" }}
      >
        <CompactSectionHeader subtitle="For vendors" title="List on the dome." />
      </div>

      {/* Connected lane cards */}
      <div className="grid gap-4 sm:grid-cols-3 xl:gap-5">
        {lanes.map((lane, idx) => (
          <article
            key={lane.step}
            className={`group relative flex flex-col rounded-3xl border border-border-subtle bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_16px_36px_-18px_rgba(95,194,74,0.35)] xl:p-7 ${
              visible ? "landing-rise" : "opacity-0"
            }`}
            style={{ animationDelay: visible ? `${100 + idx * 90}ms` : undefined }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green to-brand-green-dark font-brand text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(95,194,74,0.55)]">
              {lane.step}
            </div>
            <h3 className="mt-4 font-brand text-lg font-bold text-primary-navy">{lane.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{lane.body}</p>
            <Link
              href={lane.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-green-dark transition-colors hover:text-brand-green"
            >
              {lane.link}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </article>
        ))}
      </div>

      {/* Principles strip + primary CTA */}
      <div
        className={`mt-8 flex flex-col gap-6 rounded-3xl border border-border-subtle bg-surface-muted px-6 py-5 sm:flex-row sm:items-center sm:justify-between xl:px-7 ${
          visible ? "landing-rise" : "opacity-0"
        }`}
        style={{ animationDelay: visible ? "420ms" : undefined }}
      >
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {principles.map((text, i) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease",
                transitionDelay: visible ? `${480 + i * 80}ms` : undefined,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
        <Link
          href="/submit"
          className="group inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] transition-all hover:bg-brand-green-dark hover:-translate-y-0.5"
        >
          Submit your product
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
