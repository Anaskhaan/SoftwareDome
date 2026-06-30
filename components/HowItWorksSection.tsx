/* Badge image positions:
   imgLeft = Figma badge left + card padding (20px)
   imgTop  = Figma badge top  + card padding (20px) − circle overhead (~12px)
   So the badge visual lands at content-area origin and the circle stays visible within the card. */
const STEPS = [
  {
    num: "1",
    imgSrc: "/1.png",
    imgLeft: "20px",
    imgTop: "8px",
    title: "Explore",
    body: "Browse the live catalog by category, region, or keyword every listing admin-approved.",
  },
  {
    num: "2",
    imgSrc: "/2.png",
    imgLeft: "20px",
    imgTop: "9px",
    title: "Compare",
    body: "Stack tools side by side on fit, pricing signals, and category without leaving SoftwareDome.",
  },
  {
    num: "3",
    imgSrc: "/3.png",
    imgLeft: "25px",
    imgTop: "9px",
    title: "Verify",
    body: "Read curated metadata and positioning written for clarity, not sponsored rankings.",
  },
  {
    num: "4",
    imgSrc: "/4.png",
    imgLeft: "25px",
    imgTop: "8px",
    title: "Decide",
    body: "Shortlist with confidence and share choices with your team no pay-to-play noise.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section className="bg-white w-full py-6 md:py-12 lg:py-20">
      <div
        className="mx-auto flex flex-col px-5"
        style={{ maxWidth: "1282px", gap: "40px" }}
      >
        {/* ── Header ── */}
        <div className="flex flex-col items-center" style={{ gap: "16px" }}>
          <div className="flex flex-col items-center">
            <span
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "28px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#2F6C25",
              }}
            >
              For Buyers
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(32px, 3.2vw, 46px)",
                lineHeight: "clamp(40px, 5.5vw, 60px)",
                letterSpacing: "-1.04px",
                color: "#23252C",
                textAlign: "center",
                margin: 0,
              }}
            >
              How it works
            </h2>
          </div>

          <p
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(16px, 1.4vw, 20px)",
              lineHeight: "32px",
              color: "#54565B",
              textAlign: "center",
              maxWidth: "762px",
              margin: 0,
            }}
          >
            From first search to final shortlist. The mission section covers how listings
            enter the dome. Here is how teams move through what you have already published.
          </p>
        </div>

        {/* ── Card tray ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-row"
          style={{
            background: "#F8FFF2",
            borderRadius: "24px",
            padding: "12px",
            gap: "12px",
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative flex-1 overflow-hidden h-[220px] sm:h-[270px] xl:h-[328px]"
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              {/* Badge image — includes rounded square, icon, and numbered circle */}
              <img
                src={step.imgSrc}
                alt=""
                aria-hidden
                style={{
                  position: "absolute",
                  left: step.imgLeft,
                  top: step.imgTop,
                  height: "105px",
                  width: "auto",
                  pointerEvents: "none",
                }}
              />

              {/* Text — pinned to bottom-left */}
              <div
                className="absolute flex flex-col justify-end"
                style={{ inset: "20px", zIndex: 1 }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "24px",
                    lineHeight: "32px",
                    letterSpacing: "-0.96px",
                    color: "#000000",
                    margin: "0 0 8px 0",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "-0.32px",
                    color: "#585858",
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
