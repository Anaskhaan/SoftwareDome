import NavWrapper from "@/components/NavWrapper";
import Hero from "@/components/Hero";
import SoftwareSection from "@/components/SoftwareSection";
import AboutSection from "@/components/AboutSection";
import ProductCards from "@/components/ProductCards";
import BlogsSection from "@/components/BlogsSection";
import ForVendorsSection from "@/components/ForVendorsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { getSoftwares } from "@/app/dashboard/softwares/actions";

function PageSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-12 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export default async function Home() {
  const res = await getSoftwares();
  const softwares = res.success && res.data ? res.data : [];

  return (
    <main className="min-h-screen bg-white">
      <NavWrapper />

      <Hero />

      <PageSection id="catalog" className="bg-white scroll-mt-20">
        <SoftwareSection initialData={softwares} />
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

      <PageSection className="bg-white">
        <FaqSection />
      </PageSection>

      <Footer />
    </main>
  );
}
