import HeroSearch from "@/components/HeroSearch";

/* Figma order: Paychex · ADP · athenahealth · RXNT · HubSpot · UKG ·
   Absorb · isolved · monday · Houzz · ModMed · Epicor               */
const trustedLogos = [
  { name: "Paychex",      src: "/vendors/paychex.avif",      w: 96 },
  { name: "ADP",          src: "/vendors/adp.avif",          w: 96 },
  { name: "athenahealth", src: "/vendors/athenahealth.avif", w: 96 },
  { name: "RXNT",         src: "/vendors/rxnt.avif",         w: 96 },
  { name: "HubSpot",      src: "/vendors/hubspot.avif",      w: 96 },
  { name: "UKG",          src: "/vendors/ukg.avif",          w: 96 },
  { name: "Absorb LMS",   src: "/vendors/absorb.avif",       w: 96 },
  { name: "isolved",      src: "/vendors/isolved.avif",      w: 96 },
  { name: "monday.com",   src: "/vendors/monday.avif",       w: 96 },
  { name: "Houzz Pro",    src: "/vendors/houzz.avif",        w: 80 },
  { name: "ModMed",       src: "/vendors/modmed.avif",       w: 96 },
  { name: "Epicor",       src: "/vendors/epicor.avif",       w: 96 },
];

/* Floating vendor icon cards (xl only) — % positions within 1900×900 card */
const floatingCards = [
  { src: "/vendors/modmed.avif",       name: "ModMed",       left: "4.05%", top: "37.5%", rotate: "-8deg"  },
  { src: "/vendors/athenahealth.avif", name: "athenahealth", left: "91.2%", top: "31.9%", rotate: "10deg"  },
  { src: "/vendors/rxnt.avif",         name: "RXNT",         left: "6.11%", top: "55.5%", rotate: "6deg"   },
  { src: "/vendors/ukg.avif",          name: "UKG",          left: "89.2%", top: "51.2%", rotate: "-10deg" },
];

export default function Hero() {
  return (
    <section className="relative bg-white" aria-label="SoftwareDome home">
      {/* ── Hero card ── */}
      <div
        className="relative my-1 mx-1 overflow-hidden xl:h-[900px]"
        style={{
          background:
            "linear-gradient(0deg, rgba(247, 255, 239, 0.6) 5.94%, rgba(167, 255, 74, 0.64) 100%)",
          borderRadius: "16px",
        }}
      >
        {/* Floating software icon cards — hidden below xl */}
        {floatingCards.map((card) => (
          <div
            key={card.name}
            aria-hidden
            className="pointer-events-none absolute hidden xl:flex items-center justify-center bg-white"
            style={{
              width: "64px",
              height: "64px",
              left: card.left,
              top: card.top,
              borderRadius: "16px",
              boxShadow:
                "0px 0px 0px 1px rgba(255,255,255,0.2), 0px 25px 50px -10px rgba(0,0,0,0.15)",
              transform: `rotate(${card.rotate})`,
            }}
          >
            <img
              src={card.src}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              style={{ transform: `rotate(${card.rotate})` }}
            />
          </div>
        ))}

        {/* ── Heading + paragraph ──
            Mobile : relative flow, pt clears the 105 px fixed navbar
            Desktop: absolute at top 268.81 px, centered               */}
        <div className="relative flex flex-col items-center text-center px-6 pt-[140px] xl:absolute xl:pt-0 xl:top-[268px] xl:left-1/2 xl:-translate-x-1/2">
          <div className="flex flex-col items-center w-full px-4 sm:px-10 xl:px-[80px]" style={{ gap: "8px" }}>
            <h1
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 65px)",
                lineHeight: "clamp(38px, 5vw, 70px)",
                letterSpacing: "-1.2px",
                color: "#111111",
                textAlign: "center",
                maxWidth: "747px",
              }}
            >
              Find the right software from 100s of vendors
            </h1>

            <p
              style={{
                fontFamily: "var(--font-sora), Sora, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(15px, 1.4vw, 20px)",
                lineHeight: "26px",
                color: "#2F6C25",
                textAlign: "center",
                maxWidth: "531px",
                paddingTop: "12px",
              }}
            >
              Compare unbiased reviews, pricing, and expert advice — all under one dome.
            </p>
          </div>
        </div>

        {/* ── Search + chips (Frame 8) ──
            Mobile : relative, mt-10
            Desktop: absolute at top 522 px, centered                  */}
        <div className="relative flex flex-col items-center mt-10 xl:absolute xl:mt-0 xl:top-[522px] xl:left-1/2 xl:-translate-x-1/2">
          <HeroSearch />
        </div>

        {/* ── "Trusted by Top Vendors" label ──
            Mobile : relative flow, mt-8
            Desktop: absolute at top 784 px, full-width center          */}
        <div
          className="relative flex justify-center items-center mt-8 xl:absolute xl:mt-0 xl:inset-x-0 xl:top-[784px]"
          style={{ gap: "8px" }}
        >
          <span
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 600,
              fontSize: "20px",
              lineHeight: "16px",
              textTransform: "uppercase",
              color: "#878787",
            }}
          >
            Trusted by Top Vendors
          </span>
        </div>

        {/* ── Logo marquee ──
            Mobile : relative flow, mt-4, pb-8 (bottom breathing room)
            Desktop: absolute at top 860 px, full-width of the card     */}
        <div
          className="overflow-hidden mt-4 pb-8 xl:absolute xl:mt-0 xl:pb-0 xl:top-[860px] xl:inset-x-0"
          style={{ height: "32px" }}
        >
          <div
            className="marquee-track items-center"
            style={{ animationDuration: "30s" }}
          >
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
      </div>
    </section>
  );
}
