"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ForVendorsSection from "@/components/ForVendorsSection";
import Container from "@/components/Container";

export default function VendorsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="py-16">
        <Container>
          <ForVendorsSection />
        </Container>
      </section>

      <Footer />
    </main>
  );
}
