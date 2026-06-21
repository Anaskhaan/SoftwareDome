'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Hero from '@/components/Hero';
import SoftwareSection from '@/components/SoftwareSection';
import AboutSection from '@/components/AboutSection';
import ProductCards from '@/components/ProductCards';
import BlogsSection from '@/components/BlogsSection';
import ForVendorsSection from '@/components/ForVendorsSection';
import Footer from '@/components/Footer';
import Container from '@/components/Container';


function PageSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-12 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} transparent heroTheme="dark" />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Hero />

      <PageSection id="catalog" className="bg-white scroll-mt-20">
        <SoftwareSection />
      </PageSection>

      <PageSection className="bg-zinc-50">
        <AboutSection />
      </PageSection>

      <PageSection className="bg-zinc-50">
        <ProductCards />
      </PageSection>

      <PageSection className="bg-white">
        <BlogsSection />
      </PageSection>

      <PageSection id="vendors" className="bg-zinc-50 scroll-mt-20">
        <ForVendorsSection />
      </PageSection>

      <Footer />
    </main>
  );
}
