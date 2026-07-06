"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

export default function StaticPage({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-zinc-50/60 pb-12 pt-[120px] lg:pt-[140px]">
        <Container>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            {eyebrow}
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-sm text-zinc-500">{description}</p>
          )}
          {updatedAt && (
            <p className="mt-4 text-xs font-semibold text-zinc-400">Last updated {updatedAt}</p>
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl space-y-3 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-brand [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary-navy [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-zinc-600 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-zinc-600 [&_a]:font-semibold [&_a]:text-brand-green-dark [&_a]:hover:underline">
            {children}
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
