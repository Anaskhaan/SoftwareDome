'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ProductCards from '@/components/ProductCards';
import Footer from '@/components/Footer';


function PageSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <section className={`px-6 lg:px-20 py-12 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Hero />

      <PageSection className="bg-zinc-50">
        <AboutSection />
      </PageSection>

      <PageSection className="bg-zinc-50/50">
        <ProductCards />
      </PageSection>

      <Footer />
    </main>
  );
}
