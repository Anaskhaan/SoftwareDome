import HeroSearch from "@/components/HeroSearch";
import NavWrapper from "@/components/NavWrapper";

const trustedLogos = [
  { name: "Paychex", src: "/vendors/paychex.avif", w: 96 },
  { name: "ADP", src: "/vendors/adp.avif", w: 96 },
  { name: "athenahealth", src: "/vendors/athenahealth.avif", w: 96 },
  { name: "RXNT", src: "/vendors/rxnt.avif", w: 96 },
  { name: "HubSpot", src: "/vendors/hubspot.avif", w: 96 },
  { name: "UKG", src: "/vendors/ukg.avif", w: 96 },
  { name: "Absorb LMS", src: "/vendors/absorb.avif", w: 96 },
  { name: "isolved", src: "/vendors/isolved.avif", w: 96 },
  { name: "monday.com", src: "/vendors/monday.avif", w: 96 },
  { name: "Houzz Pro", src: "/vendors/houzz.avif", w: 80 },
  { name: "ModMed", src: "/vendors/modmed.avif", w: 96 },
  { name: "Epicor", src: "/vendors/epicor.avif", w: 96 },
];

const floatingCards = [
  { src: "/heroIcon1.webp", name: "ModMed", left: "4.05%", top: "40%", rotate: "-8deg" },
  { src: "/heroIcon2.webp", name: "athenahealth", left: "91.2%", top: "35%", rotate: "10deg" },
  { src: "/heroIcon3.webp", name: "RXNT", left: "6.11%", top: "58%", rotate: "6deg" },
  { src: "/heroIcon4.webp", name: "UKG", left: "89.2%", top: "55%", rotate: "-10deg" },
];

export default function Hero() {
  return (
    <div className="p-1">
      <section className="relative rounded-t-lg bg-gradient-to-b from-[#A7FF4AA3] to-[#F7FFEF99] flex flex-col overflow-hidden">

        {/* Navbar lives inside the hero section */}
        <NavWrapper />

        {/* Floating decorative cards — absolute, visible only on xl screens */}
        {floatingCards.map((card) => (
          <div
            key={card.name}
            aria-hidden
            className="pointer-events-none absolute hidden xl:flex"
            style={{ left: card.left, top: card.top }}
          >
            <img
              src={card.src}
              alt=""
              width={100}
              height={100}
              className="object-contain"
              style={{ transform: `rotate(${card.rotate})` }}
            />
          </div>
        ))}

        <div className="flex flex-col items-center justify-center gap-4 px-4 pt-[120px] pb-14 md:pt-[130px] md:pb-16 lg:pt-[140px] lg:pb-20 text-center">

          <h1
            className="font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 65px)",
              lineHeight: "1.1",
              letterSpacing: "-1.2px",
            }}
          >
            Find the right{" "}
            <span className="text-[#5FC24A]">software</span>
            <br />
            from 100s of vendors
          </h1>

          {/* Sub-headline */}
          <p
            className="max-w-lg w-full"
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontSize: "clamp(15px, 1.5vw, 20px)",
              fontWeight: 400,
              lineHeight: "1.5",
              color: "#2F6C25",
            }}
          >
            Compare unbiased reviews, pricing, and expert advice, all under one dome.
          </p>

          {/* Search bar */}
          <HeroSearch />
        </div>

        {/* ── Trusted by Top Vendors strip ─────────────────────────────── */}
        <div className="flex justify-center pb-2">
          <span
            className="font-bold uppercase leading-4"
            style={{ color: "#878787", fontSize: "12px", letterSpacing: "0.08em" }}
          >
            Trusted by Top Vendors
          </span>
        </div>

        {/* Marquee */}
        <div className="overflow-hidden pb-8">
          <div className="marquee-track" style={{ animationDuration: "30s" }}>
            {[...trustedLogos, ...trustedLogos].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: "144px", height: "32px" }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  width={logo.w}
                  height={32}
                  loading="lazy"
                  className="object-contain"
                  style={{ width: `${logo.w}px`, height: "32px", opacity: 0.7 }}
                />
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}
