"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SoftwareSection from "@/components/SoftwareSection";
import Container from "@/components/Container";
import { Star, Users, ArrowRight } from "@/lib/fa-icons";
import Link from "next/link";

const HERO_GRADIENT = {
  background:
    "linear-gradient(120deg, var(--navy-800) 0%, var(--navy-700) 45%, var(--green-700) 100%)",
};

const BENEFIT_CARDS = [
  {
    icon: Star,
    title: "Help Other Buyers",
    desc: "Your honest review helps thousands of decision-makers choose the right software.",
    accent: "bg-brand-green/15 text-brand-green",
  },
  {
    icon: Users,
    title: "Build Your Reputation",
    desc: "Share verified experiences and become a trusted voice in the software community.",
    accent: "bg-white/10 text-white",
  },
];

const STEPS = [
  { n: "01", label: "Find a product" },
  { n: "02", label: "Open its listing" },
  { n: "03", label: "Write your review" },
];

export default function WriteReviewPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-surface-muted">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pb-20 pt-[120px] text-center lg:pt-[140px]"
        style={HERO_GRADIENT}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-16 h-[480px] w-[480px] rounded-full bg-white/[0.03]"
            style={{ filter: "blur(100px)" }}
          />
          <div
            className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-black/20"
            style={{ filter: "blur(70px)" }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <Container className="relative z-10">
          <h1 className="mx-auto mt-3 max-w-2xl font-brand text-5xl font-bold leading-tight text-white md:text-[60px]">
            Share Your Experience
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-white/45">
            Help millions of buyers make better software decisions with your
            honest, verified review.
          </p>

          {/* Step indicators */}
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-0">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[11px] font-bold text-white">
                    {step.n}
                  </div>
                  <span className="text-[10px] font-semibold text-white/50">
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mb-4 mx-3 h-px w-10 bg-white/15" />
                )}
              </div>
            ))}
          </div>

          {/* Benefit cards — float over hero bottom */}
          <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            {BENEFIT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-white/8 p-5 text-left backdrop-blur-sm"
                >
                  <div
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}
                  >
                    <Icon size={16} />
                  </div>
                  <h3 className="font-brand text-[15px] font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Software catalog ─────────────────────────────────────────── */}
      <section className="pb-24 pt-12">
        <Container>
          {/* Section label */}
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-green-dark">
                Step 1
              </p>
              <h2 className="mt-1 font-brand text-2xl font-bold text-navy-800">
                Find a product to review
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Search the catalog, open a listing, and share your experience.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-green-dark hover:underline"
            >
              Browse all categories
              <ArrowRight size={12} />
            </Link>
          </div>

          <SoftwareSection />
        </Container>
      </section>

      <Footer />
    </main>
  );
}
