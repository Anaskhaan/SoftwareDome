"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Container from "@/components/Container";
import { ArrowRight, ShieldCheck, Zap, Layers, Mail, CheckCircle } from "@/lib/fa-icons";

const footerLinks = {
  product: [
    { name: "Categories", href: "/categories" },
    { name: "Top Rated", href: "/top-software" },
    { name: "Deals", href: "/deals" },
    { name: "Submit Product", href: "/submit" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Mission", href: "/mission" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const trustBadges = [
  { icon: ShieldCheck, label: "Verified listings" },
  { icon: Zap, label: "Updated weekly" },
  { icon: Layers, label: "300+ categories" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer className="relative overflow-hidden bg-primary-navy pt-20 pb-10 text-white">
      {/* Decorative glow blobs */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent-blue/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <Container className="relative">
        {/* CTA strip */}
        <div className="mb-16 flex flex-col items-center justify-between gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm sm:flex-row sm:p-10">
          <div className="text-center sm:text-left">
            <h3 className="font-brand text-2xl font-bold text-white sm:text-3xl">
              Stay ahead of the curve.
            </h3>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Get the best new software picks and category insights, straight to your inbox. No spam, ever.
            </p>
          </div>

          {subscribed ? (
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-brand-green/15 px-5 py-3 text-sm font-bold text-brand-green-light">
              <CheckCircle size={16} />
              You're subscribed!
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-sm shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-4"
            >
              <Mail size={16} className="shrink-0 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-primary-navy transition-all hover:-translate-y-0.5 hover:bg-brand-green-light"
              >
                Subscribe
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-14 md:grid-cols-12">
          <div className="md:col-span-4 flex flex-col gap-6">
            <Logo size="md" variant="dark" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              The industry's most trusted verification layer for SaaS tools. We audit, compare, and
              verify so you don't have to.
            </p>
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300"
                >
                  <badge.icon size={12} className="text-brand-green" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-green-light">
                Directory
              </h4>
              <ul className="flex flex-col gap-3.5">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-600 transition-colors group-hover:bg-brand-green" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-green-light">
                Organization
              </h4>
              <ul className="flex flex-col gap-3.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-600 transition-colors group-hover:bg-brand-green" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-green-light">
                Legal
              </h4>
              <ul className="flex flex-col gap-3.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-zinc-600 transition-colors group-hover:bg-brand-green" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} SoftwareDome Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
            </span>
            All systems operational
          </div>
        </div>
      </Container>
    </footer>
  );
}
