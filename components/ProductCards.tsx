const STEPS = [
  {
    num: "1",
    numLeft: "5px",
    numTop: "40px",
    title: "Intake",
    body: "Vendors submit products from any region via our dashboard.",
  },
  {
    num: "2",
    numLeft: "25px",
    numTop: "61px",
    title: "Curate",
    body: "Admins verify listings, metadata, and positioning before publish.",
  },
  {
    num: "3",
    numLeft: "5px",
    numTop: "41px",
    title: "Publish",
    body: "Approved software enters the global SoftwareDome index.",
  },
  {
    num: "4",
    numLeft: "5px",
    numTop: "40px",
    title: "Discover",
    body: "Teams search, compare & choose tools without sponsored noise.",
  },
] as const;

export default function ProductCards() {
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
              For Vendor
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
              Listing pipeline
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
            SoftwareDome keeps discovery and listing operations in one visual language
            — catalog above, path below, footer to close.
          </p>
        </div>

        {/* ── Card tray ── */}
        <div
          className="flex flex-col xl:flex-row"
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
              className="relative flex-1 overflow-hidden"
              style={{
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "20px",
                height: "328px",
              }}
            >
              {/* Ghost number */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: step.numLeft,
                  top: step.numTop,
                  fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: "150px",
                  lineHeight: "1",
                  letterSpacing: "-0.96px",
                  color: "#EBFFD7",
                  userSelect: "none",
                  zIndex: 0,
                }}
              >
                {step.num}
              </span>

              {/* Text — pinned to bottom-left */}
              <div
                className="absolute flex flex-col justify-end"
                style={{
                  inset: "20px",
                  zIndex: 1,
                }}
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
