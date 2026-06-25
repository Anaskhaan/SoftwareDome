"use client";

import Link from "next/link";
import { ArrowRight } from "@/lib/fa-icons";
import { useInView } from "@/hooks/useInView";

/* ── Static chart values — no Math.random(), SSR-safe ── */
const BARS = [
  { h: 28 }, { h: 44 }, { h: 32 }, { h: 52 },
  { h: 38 }, { h: 22 }, { h: 48 },
];

/* Donut — r=22, circumference ≈ 138.2 */
const DONUT_R = 22;
const DONUT_C = 2 * Math.PI * DONUT_R;
const DONUT_PCT = 0.68;

const PROFILE_CARDS = [
  {
    bg: "bg-navy-800",
    initials: "SD",
    name: "SoftwareDome",
    desc: "Discover and compare the best business software.",
    tags: ["Discovery", "Analytics"],
  },
  {
    bg: "bg-brand-green-dark",
    initials: "AX",
    name: "Acme CRM Pro",
    desc: "Streamline your customer relationships at scale.",
    tags: ["CRM", "Sales"],
  },
  {
    bg: "bg-navy-500",
    initials: "TF",
    name: "TaskFlow",
    desc: "Project management made simple for modern teams.",
    tags: ["PM", "Teams"],
  },
];

export default function ForVendorsSection() {
  const { ref, visible } = useInView(0.05);

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-2">

      {/* ── Card 1 : Get More Leads ──────────────────────────────────── */}
      <div
        className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-12px_rgba(10,25,47,0.18)] ring-1 ring-black/5 transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Text */}
        <div className="px-8 pb-5 pt-8">
          <h2 className="font-brand text-[22px] font-bold text-navy-800">
            Get More Leads
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-muted">
            Get Sales-Ready Leads Without The Wait
          </p>
          <Link
            href="/login?mode=signup&role=VENDOR"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_18px_-2px_rgba(95,194,74,0.5)] transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark"
          >
            Get Sales-Ready Leads
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Mockup area */}
        <div className="mx-6 mb-6 flex-1 overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted p-5">
          <div className="flex items-start justify-between gap-4">

            {/* Left: stat + bar chart */}
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Total Leads
              </p>
              <p className="mt-1 text-[28px] font-bold leading-none text-navy-800">
                96.6k
              </p>
              <p className="mt-1 text-[12px] font-bold text-brand-green-dark">
                +2.8%
              </p>

              {/* Bar chart */}
              <div className="mt-4 flex h-12 items-end gap-1">
                {BARS.map(({ h }, i) => (
                  <div
                    key={i}
                    className="relative flex-1 overflow-hidden rounded-t-sm bg-brand-green/10"
                    style={{ height: 48 }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-brand-green transition-all duration-700"
                      style={{
                        height: visible ? h : 0,
                        transitionDelay: `${180 + i * 55}ms`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: donut chart */}
            <div className="shrink-0">
              <svg width="72" height="72" viewBox="0 0 72 72">
                {/* Track */}
                <circle
                  cx="36" cy="36" r={DONUT_R}
                  fill="none"
                  stroke="#e7ede6"
                  strokeWidth="7"
                />
                {/* Fill */}
                <circle
                  cx="36" cy="36" r={DONUT_R}
                  fill="none"
                  stroke="#5fc24a"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${DONUT_C * DONUT_PCT} ${DONUT_C}`}
                  transform="rotate(-90 36 36)"
                  style={{
                    transition: "stroke-dasharray 1s ease",
                    strokeDasharray: visible
                      ? `${DONUT_C * DONUT_PCT} ${DONUT_C}`
                      : `0 ${DONUT_C}`,
                    transitionDelay: "400ms",
                  }}
                />
                {/* Label */}
                <text
                  x="36" y="40"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#0a192f"
                >
                  {Math.round(DONUT_PCT * 100)}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2 : List Your Software ──────────────────────────────── */}
      <div
        className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-12px_rgba(10,25,47,0.18)] ring-1 ring-black/5 transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        style={{ transitionDelay: visible ? "100ms" : undefined }}
      >
        {/* Text */}
        <div className="px-8 pb-5 pt-8">
          <h2 className="font-brand text-[22px] font-bold text-navy-800">
            List Your Software
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-muted">
            Make Your Software Stand Out — List And Perfect Your SoftwareDome
            Profile
          </p>
          <Link
            href="/login?mode=signup&role=VENDOR"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_18px_-2px_rgba(95,194,74,0.5)] transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark"
          >
            List Now &amp; Get Seen!
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Mockup area */}
        <div className="mx-6 mb-6 flex-1 space-y-2.5 overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted p-4">
          {PROFILE_CARDS.map((card, i) => (
            <div
              key={card.name}
              className="flex items-start gap-3 rounded-xl border border-border-subtle bg-white px-3.5 py-3 shadow-sm transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
                transitionDelay: `${250 + i * 100}ms`,
              }}
            >
              {/* Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg} text-[11px] font-bold text-white`}
              >
                {card.initials}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-navy-800">{card.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-text-muted">
                  {card.desc}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-[9px] font-bold text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini sparkline */}
              <svg
                width="40" height="24"
                viewBox="0 0 40 24"
                className="mt-1 shrink-0 opacity-60"
              >
                <polyline
                  points="0,20 8,14 16,16 24,8 32,10 40,4"
                  fill="none"
                  stroke="#5fc24a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
