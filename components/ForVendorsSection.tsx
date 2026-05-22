"use client";

import Link from "next/link";
import CompactSectionHeader from "./CompactSectionHeader";
import { useInView } from "@/hooks/useInView";

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
      {/* Ambient line — not a card */}
      <div
        className="pointer-events-none absolute -right-8 top-1/2 hidden h-px w-[55%] -translate-y-1/2 bg-gradient-to-l from-primary-navy/20 to-transparent lg:block"
        aria-hidden
      />

      <div
        className={visible ? "landing-rise" : "opacity-0"}
        style={{ animationDelay: "0ms" }}
      >
        <CompactSectionHeader subtitle="For vendors" title="List on the dome." />
      </div>

      {/* SVG connector — desktop only */}
      <svg
        className="pointer-events-none absolute left-8 top-[11.5rem] hidden h-[calc(100%-12rem)] w-8 lg:block"
        viewBox="0 0 32 200"
        fill="none"
        aria-hidden
      >
        <path
          d="M16 0 V200"
          stroke="currentColor"
          strokeWidth="1"
          className={`text-primary-navy/15 ${visible ? "landing-dash-path" : ""}`}
        />
      </svg>

      {/* Runway lanes — full-width stripes, not bento */}
      <div className="space-y-0">
        {lanes.map((lane, idx) => (
          <article
            key={lane.step}
            className={`group relative border-t border-zinc-200 py-7 pl-0 lg:pl-14 ${
              visible ? "landing-rise" : "opacity-0"
            }`}
            style={{ animationDelay: visible ? `${100 + idx * 90}ms` : undefined }}
          >
            <span
              className="pointer-events-none absolute -left-1 top-7 font-mono text-[4.5rem] font-black leading-none text-primary-navy/[0.04] sm:text-[5.5rem]"
              aria-hidden
            >
              {lane.step}
            </span>

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-primary-navy/40">
                    {lane.step}
                  </span>
                  <span
                    className={`h-px flex-1 max-w-[4rem] bg-primary-navy/20 transition-all duration-700 ${
                      visible ? "w-16 opacity-100" : "w-0 opacity-0"
                    }`}
                    style={{ transitionDelay: `${200 + idx * 120}ms` }}
                  />
                </div>
                <h3 className="text-lg font-black text-primary-navy">{lane.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{lane.body}</p>
              </div>
              <Link
                href={lane.href}
                className="shrink-0 text-sm font-bold text-primary-navy underline-offset-4 hover:underline"
              >
                {lane.link} →
              </Link>
            </div>

            <div
              className={`absolute left-0 top-0 h-full w-0.5 bg-primary-navy transition-all duration-700 ease-out ${
                visible ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: visible ? "scaleY(1)" : "scaleY(0)",
                transformOrigin: "top",
                transitionDelay: `${150 + idx * 100}ms`,
              }}
            />
          </article>
        ))}
        <div className="border-t border-zinc-200" />
      </div>

      {/* Principles strip + primary CTA — inline, not boxed */}
      <div
        className={`mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between ${
          visible ? "landing-rise" : "opacity-0"
        }`}
        style={{ animationDelay: visible ? "420ms" : undefined }}
      >
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {principles.map((text, i) => (
            <li
              key={text}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease",
                transitionDelay: visible ? `${480 + i * 80}ms` : undefined,
              }}
            >
              {text}
            </li>
          ))}
        </ul>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 border-b-2 border-primary-navy pb-0.5 text-sm font-black text-primary-navy transition-colors hover:border-accent-blue hover:text-accent-blue"
        >
          Submit your product
          <span className="text-base" aria-hidden>
            ↗
          </span>
        </Link>
      </div>
    </div>
  );
}
