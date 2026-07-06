"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import ForVendorsSection from "@/components/ForVendorsSection";

const FEATURED_ROWS = [
  ["Jira Software", "Monday.com", "HubSpot", "Salesforce", "Wrike"],
  ["BambooHR", "Asana", "Zendesk", "ADP Workforce Now", "Workday"],
  ["Slack", "Notion", "ClickUp", "Freshdesk", "Zoho CRM"],
];

export default function VendorsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-surface-muted">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pb-44 pt-[120px] text-center lg:pt-[140px]"
        style={{
          background: "linear-gradient(120deg, var(--navy-800) 0%, var(--navy-700) 45%, var(--green-700) 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-16 h-[500px] w-[500px] rounded-full bg-white/[0.03]"
            style={{ filter: "blur(100px)" }}
          />
          <div
            className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-black/20"
            style={{ filter: "blur(70px)" }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <Container className="relative z-10">
          <span className="mb-4 inline-block rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-green">
            For Vendors
          </span>
          <h1 className="mx-auto mt-3 max-w-3xl font-brand text-5xl font-bold leading-tight text-white md:text-[64px]">
            B2B Success Hub
          </h1>
          <p className="mt-4 text-lg text-white/45">
            Fast-Track Your Growth With Instant Results
          </p>
        </Container>
      </section>

      {/* ── Two cards floating over hero bottom ────────────────────────── */}
      <section className="relative z-10 -mt-28 pb-10">
        <Container>
          <ForVendorsSection showHeader={false} />
        </Container>
      </section>

      {/* ── Top Listed Software strip ───────────────────────────────────── */}
      <section className="pb-24">
        <Container>
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

              {/* Badge */}
              <div className="flex shrink-0 items-center gap-4">
                <div
                  className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background: "linear-gradient(120deg, var(--navy-800) 0%, var(--navy-700) 45%, var(--green-700) 100%)",
                  }}
                >
                  <img src="/logomark.svg" alt="" className="h-9 w-9" />
                  <span className="absolute -bottom-2 -right-2 rounded-full bg-brand-green px-1.5 py-0.5 text-[9px] font-black text-white">
                    2026
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                    SoftwareDome
                  </p>
                  <p className="mt-0.5 font-brand text-xl font-bold leading-snug text-navy-800">
                    Excellence<br />Award Winners
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden h-16 w-px bg-border-subtle lg:block" />

              {/* Pills */}
              <div className="flex-1 space-y-2.5 overflow-hidden">
                {FEATURED_ROWS.map((row, i) => (
                  <div key={i} className="flex flex-wrap gap-2">
                    {row.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-[12px] font-semibold text-navy-800 transition-colors hover:border-brand-green/30 hover:bg-brand-green/5"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
