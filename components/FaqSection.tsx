"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "What is SoftwareDome, and how can it help my business?",
    a: "SoftwareDome is a B2B software discovery platform built to help businesses find the right tools, faster. Instead of spending hours researching scattered options, you get unbiased reviews, expert recommendations, and a curated catalog of business software — all in one place.",
  },
  {
    q: "Can I trust SoftwareDome reviews?",
    a: (
      <>
        Yes. SoftwareDome reviews are sourced from real, verified users, not paid placements. We
        provide transparent pricing breakdowns, product demos, and honest industry insights so you
        can make decisions based on facts, not sales pitches.{" "}
        <Link href="/blog" className="font-semibold text-brand-green-dark hover:underline">
          Learn more about our review and testing methodology here.
        </Link>
      </>
    ),
  },
  {
    q: "Is there a cost to use SoftwareDome?",
    a: "No — SoftwareDome is completely free to use. Every review, comparison, and buying guide on our platform is free to access, because we believe businesses of every size deserve unbiased software guidance without hidden fees or paywalls.",
  },
  {
    q: "How can software vendors benefit from SoftwareDome?",
    a: "Vendors can join the SoftwareDome Vendor Program to generate qualified, ready-to-buy leads at a lower cost per acquisition, strengthen brand visibility, and connect directly with buyers who are actively searching for solutions like theirs.",
  },
  {
    q: "How do I get help choosing the right software for my business?",
    a: "Simply fill out the short form on our homepage with your name, phone number, email, and organization details. One of SoftwareDome's solution experts will reach out with free, personalized recommendations based on your budget, industry, and business requirements.",
  },
  {
    q: "Which software categories does SoftwareDome cover?",
    a: "SoftwareDome covers a wide range of software categories, including Healthcare/Medical, HR, Accounting, CRM, Project Management, CMMS, Field Service Management, and Legal Practice Management — with more added regularly. Whether you're a solo practice or a large enterprise, we help you compare options across every budget and deployment model (cloud, on-premise, or hybrid).",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block rounded-full border border-brand-green/30 bg-brand-green/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-800">
          FAQ
        </span>
        <h2 className="mt-2 font-brand text-3xl font-bold text-navy-800 md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-[15px] text-text-muted">
          Everything you need to know about SoftwareDome.
        </p>
      </div>

      {/* Accordion */}
      <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-white shadow-sm">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-muted"
              >
                <span
                  className={`font-brand text-[15px] font-bold leading-snug transition-colors ${
                    isOpen ? "text-brand-green-dark" : "text-navy-800"
                  }`}
                >
                  {faq.q}
                </span>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isOpen
                      ? "border-brand-green/30 bg-brand-green/10 text-brand-green-dark"
                      : "border-border-subtle bg-surface-muted text-text-muted"
                  }`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  >
                    <path
                      d="M5 1v8M1 5h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-[14px] leading-relaxed text-text-muted">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
