"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SoftwareSection from "@/components/SoftwareSection";
import Container from "@/components/Container";

export default function WriteReviewPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-zinc-50/60 py-12">
        <Container>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            Write a review
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            Find a product to review
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Search the catalog, open a listing, and share your verified experience with other buyers.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <SoftwareSection />
        </Container>
      </section>

      <Footer />
    </main>
  );
}
