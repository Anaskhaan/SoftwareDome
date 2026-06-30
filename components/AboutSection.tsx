const CARDS = [
  {
    key: "global-intake",
    title: "Global intake",
    body: "Listings originate worldwide — startups, enterprises, and indie makers on one surface.",
    imgSrc: "/Image (Decoration Image).png",
    imgW: 323,
    imgH: 261,
    imgTop: 40,
    imgBlur: false,
  },
  {
    key: "admin-control",
    title: "Admin control",
    body: "Your dashboard is the gate: add, edit, and approve what appears in the public catalog.",
    imgSrc: "/admin-dashboard.png",
    imgW: 419,
    imgH: 243,
    imgTop: 22,
    imgBlur: true,
  },
  {
    key: "trusted-surface",
    title: "Trusted surface",
    body: "Every product is positioned for clarity so buyers decide on fit, not marketing fluff.",
    imgSrc: "/3d-shield-illustration-isolated-white-background 1.png",
    imgW: 142,
    imgH: 150,
    imgTop: 95,
    imgBlur: false,
  },
] as const;

function CardCaption({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
      style={{ padding: "0 40px 36px", gap: "8px" }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "32px",
          color: "#23252C",
          textAlign: "center",
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-sora), Sora, sans-serif",
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: "28px",
          color: "#54565B",
          textAlign: "center",
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  height: "440px",
  background: "linear-gradient(180deg, #E1FFC1 0%, #FFFFFF 100%)",
  borderRadius: "20px",
  position: "relative",
  overflow: "hidden",
  flex: "1 1 0",
};

export default function AboutSection() {
  return (
    <section className="w-full py-6 md:py-12 lg:py-20" style={{ background: "#FBFFF6" }}>
      <div
        className="mx-auto flex flex-col px-5 xl:px-[80px]"
        style={{ maxWidth: "1281px", gap: "0" }}
      >
        {/* ── Header row ── */}
        <div
          className="flex flex-col xl:flex-row xl:justify-between xl:items-end"
          style={{ gap: "40px" }}
        >
          {/* Left: label + heading */}
          <div style={{ maxWidth: "619px" }}>
            <span
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "28px",
                textTransform: "uppercase",
                color: "#2F6C25",
                display: "block",
              }}
            >
              Our Mission
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(32px, 3.2vw, 46px)",
                lineHeight: "clamp(40px, 5.5vw, 60px)",
                letterSpacing: "-1.04px",
                color: "#23252C",
                margin: "8px 0 0",
              }}
            >
              The world&apos;s software, indexed under one dome.
            </h2>
          </div>

          {/* Right: body text — aligns to bottom of heading on xl */}
          <p
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(16px, 1.4vw, 20px)",
              lineHeight: "32px",
              color: "#54565B",
              maxWidth: "593px",
              margin: 0,
            }}
          >
            SoftwareDome exists to enlist and organize software from every corner of the
            planet curated by admins, discovered by teams who need the right tool, not the
            loudest ad.
          </p>
        </div>

        {/* ── Feature cards ── */}
        <div
          className="flex flex-col"
          style={{ gap: "20px", paddingTop: "48px" }}
        >
          {/* Row 1 */}
          <div className="flex flex-col xl:flex-row" style={{ gap: "20px" }}>
            {/* Cards 1 & 2 */}
            {CARDS.slice(0, 2).map((card) => (
              <div key={card.key} style={CARD_STYLE}>
                {/* Illustration */}
                <img
                  src={card.imgSrc}
                  alt=""
                  aria-hidden
                  style={{
                    position: "absolute",
                    width: `${card.imgW}px`,
                    height: `${card.imgH}px`,
                    left: `calc(50% - ${card.imgW / 2}px)`,
                    top: `${card.imgTop}px`,
                    objectFit: "contain",
                    borderRadius: "12.8px",
                    filter: card.imgBlur ? "blur(2px)" : "none",
                  }}
                />
                <CardCaption title={card.title} body={card.body} />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-col xl:flex-row" style={{ gap: "20px" }}>
            {/* Card 3: Trusted surface */}
            <div style={CARD_STYLE}>
              <img
                src={CARDS[2].imgSrc}
                alt=""
                aria-hidden
                style={{
                  position: "absolute",
                  width: `${CARDS[2].imgW}px`,
                  height: `${CARDS[2].imgH}px`,
                  left: `calc(50% - ${CARDS[2].imgW / 2}px)`,
                  top: `${CARDS[2].imgTop}px`,
                  objectFit: "contain",
                }}
              />
              <CardCaption title={CARDS[2].title} body={CARDS[2].body} />
            </div>

            {/* Card 4: One index — CSS concentric circles + logomark */}
            <div style={CARD_STYLE}>
              {/* Concentric ring group, centered horizontally, top: -4px */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: "406px",
                  height: "384px",
                  left: "calc(50% - 203px)",
                  top: "-4px",
                }}
              >
                {/* Ring 1 — 365.4 px */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "365.4px",
                    height: "365.4px",
                    border: "0.9px solid rgba(255,255,255,0.7)",
                    borderRadius: "9999px",
                  }}
                >
                  {/* Ring 2 — 291.6 px */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "291.6px",
                      height: "291.6px",
                      border: "0.9px solid rgba(255,255,255,0.7)",
                      borderRadius: "9999px",
                    }}
                  >
                    {/* Ring 3 — 217.8 px */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: "217.8px",
                        height: "217.8px",
                        border: "0.9px solid rgba(255,255,255,0.7)",
                        borderRadius: "9999px",
                      }}
                    >
                      {/* Centre: dark-green tile with logomark */}
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: "72px",
                          height: "72px",
                          background: "#072929",
                          borderRadius: "10px",
                        }}
                      >
                        <img
                          src="/logomark.svg"
                          alt="SoftwareDome"
                          width={42}
                          height={42}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardCaption
                title="One index"
                body="SoftwareDome becomes the single dome over fragmented directories and biased roundups."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
