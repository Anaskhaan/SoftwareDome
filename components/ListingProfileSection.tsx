"use client";

import Link from "next/link";
import CompactSectionHeader from "./CompactSectionHeader";
import { useInView } from "@/hooks/useInView";

const profileFields = [
  { key: "introduction", label: "Introduction", fill: 94 },
  { key: "our_verdict", label: "Our verdict", fill: 88 },
  { key: "key_takeaways", label: "Key takeaways", fill: 76 },
  { key: "pros_cons", label: "Pros & cons", fill: 82 },
  { key: "how_it_works", label: "How it works", fill: 70 },
  { key: "who_is_it_for", label: "Who it is for", fill: 68 },
  { key: "differentiation", label: "Differentiation", fill: 65 },
  { key: "sentiments", label: "Market sentiment", fill: 62 },
  { key: "specifications", label: "Specifications", fill: 80 },
  { key: "gallery", label: "Media gallery", fill: 74 },
  { key: "faqs", label: "FAQs", fill: 71 },
  { key: "rating_report", label: "Rating & report URL", fill: 86 },
];

export default function ListingProfileSection() {
  const { ref, visible } = useInView(0.1);

  return (
    <div ref={ref} className="relative">
      <div
        className={visible ? "landing-rise" : "opacity-0"}
        style={{ animationDelay: "0ms" }}
      >
        <CompactSectionHeader
          subtitle="Each listing"
          title="Full evaluation profiles."
        />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_13rem] lg:gap-12">
        {/* Dossier terminal — not a card grid */}
        <div
          className={`landing-scan-track border border-zinc-200 bg-zinc-950 text-zinc-100 ${
            visible ? "landing-rise" : "opacity-0"
          }`}
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[10px] text-zinc-500">
            <span>
              profile://dome/<span className="text-emerald-400/90">listing.schema</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400/80">
              synced
              <span className="landing-cursor inline-block h-3 w-1.5 bg-emerald-400/90" />
            </span>
          </div>

          <ul className="divide-y divide-white/[0.06] px-4 py-2">
            {profileFields.map((field, idx) => (
              <li
                key={field.key}
                className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {field.key}
                </span>
                <div className="min-w-0">
                  <div className="mb-1 flex justify-between gap-2 text-xs text-zinc-300">
                    <span>{field.label}</span>
                    <span className="tabular-nums text-zinc-600">{field.fill}%</span>
                  </div>
                  <div className="h-px overflow-hidden bg-white/10">
                    <div
                      className={`h-full origin-left bg-emerald-500/70 ${visible ? "landing-bar" : "scale-x-0"}`}
                      style={{
                        width: `${field.fill}%`,
                        animationDelay: visible ? `${120 + idx * 45}ms` : undefined,
                      }}
                    />
                  </div>
                </div>
                <span className="hidden font-mono text-[9px] uppercase tracking-widest text-zinc-600 sm:inline">
                  field
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 px-4 py-3 font-mono text-[10px] text-zinc-600">
            <span className="text-zinc-500">{">"}</span> 12 modules · admin-authored · public slug route
          </div>
        </div>

        {/* Side notes — typographic, no boxes */}
        <aside
          className={`mt-8 space-y-6 lg:mt-0 ${visible ? "landing-rise" : "opacity-0"}`}
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-sm leading-relaxed text-zinc-600">
            Dashboard fields map 1:1 to the public software page — verdict, specs, gallery, and
            FAQs included.
          </p>
          <div className="space-y-4 border-l border-primary-navy/15 pl-4">
            <p className="text-xs leading-relaxed text-zinc-500">
              <span className="font-bold text-primary-navy">Buyers</span> — evaluate depth in one
              tab.
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              <span className="font-bold text-primary-navy">Vendors</span> — ship one complete
              profile, not a link dump.
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              <span className="font-bold text-primary-navy">Admins</span> — thin listings never
              hit the index.
            </p>
          </div>
          <Link
            href="#catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-navy underline-offset-4 hover:underline"
          >
            View live profiles
            <span aria-hidden>→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
