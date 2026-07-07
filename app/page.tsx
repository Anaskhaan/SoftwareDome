export const revalidate = 600; // ISR: re-generate at most every 10 minutes


import Hero from "@/components/Hero";
import SoftwareSection from "@/components/SoftwareSection";
import AboutSection from "@/components/AboutSection";
import ProductCards from "@/components/ProductCards";
import HowItWorksSection from "@/components/HowItWorksSection";
import VendorsOrbitSection from "@/components/VendorsOrbitSection";
import BlogsSection from "@/components/BlogsSection";
import ForVendorsSection from "@/components/ForVendorsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import LeadCtaSection from "@/components/LeadCtaSection";
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
      <Hero softwares={softwares} />

      <SoftwareSection initialData={softwares} />

      <AboutSection />

      <ProductCards />

      <HowItWorksSection />

      <VendorsOrbitSection initialData={softwares} />

      <PageSection id="vendors" className="bg-zinc-50 scroll-mt-20">
        <ForVendorsSection />
      </PageSection>
      <PageSection className="bg-[#FBFFF6] md:!py-20">
        <BlogsSection />
      </PageSection>
      <PageSection className="bg-white md:!py-20">
        <FaqSection />
      </PageSection>

      <LeadCtaSection />

      <Footer />
    </main>
  );
}
