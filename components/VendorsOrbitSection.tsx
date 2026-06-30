import Link from "next/link";

// Orbit centered on the logo (Y=342px). Radius 316px chosen so endpoint icons
// (at ±110° from top) land at Y=450px — their top edges sit exactly at the
// hills horizon (Y=410px), giving the half-submerged depth effect.
// 220° symmetric arc (250° → 0°/top → 110°), 27.5° step, 9 icons.
const ORBIT_RADIUS = 316;
const ORBIT_CENTER_Y = 342;
const HILLS_Y = 410;

const ICON_POSITIONS = Array.from({ length: 9 }, (_, i) => {
  const deg = 250 + i * 27.5;
  const rad = (deg * Math.PI) / 180;
  const x = ORBIT_RADIUS * Math.sin(rad);
  const y = ORBIT_RADIUS * -Math.cos(rad);
  return { x, y, z: ORBIT_CENTER_Y + y > HILLS_Y ? 0 : 2 };
});

export default function VendorsOrbitSection({
  initialData,
}: {
  initialData?: any[];
}) {
  const softwares = (initialData ?? []).slice(0, ICON_POSITIONS.length);

  return (
    /* 10 px side margin so section floats inside white page bg */
    <div style={{ padding: "0 10px", background: "#FFFFFF" }}>
      <section
        className="relative w-full overflow-hidden"
        style={{
          background: "#F7FFEF",
          borderRadius: "30px",
          height: "700px",
        }}
      >
        {/* ── Floating software icon circles ── */}
        {ICON_POSITIONS.map((pos, i) => {
          const sw = softwares[i];
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center overflow-hidden"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `${ORBIT_CENTER_Y + pos.y}px`,
                width: "80px",
                height: "80px",
                background: "#FFFFFF",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow:
                  "0px 4px 16px rgba(0,0,0,0.08), 0px 0px 0px 1px rgba(0,0,0,0.04)",
                zIndex: pos.z,
              }}
            >
              {sw?.logo ? (
                <img
                  src={sw.logo}
                  alt={sw.name ?? ""}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#0A192F",
                  }}
                >
                  {sw?.name?.[0] ?? "?"}
                </span>
              )}
            </div>
          );
        })}

        {/* ── Center content ── */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: "50%",
            top: "277px",
            transform: "translateX(-50%)",
            gap: "30px",
            zIndex: 3,
            width: "493px",
          }}
        >
          {/* SoftwareDome logo circle */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: "130px",
              height: "130px",
              background: "#072929",
              borderRadius: "50%",
              boxShadow:
                "inset -1.49px -1.49px 2.98px rgba(255,255,255,0.3), inset 1.49px 1.49px 2.98px rgba(255,255,255,0.3), 0px 2.98px 5.96px rgba(29,29,29,0.5)",
            }}
          >
            <img
              src="/logomark.svg"
              alt="SoftwareDome"
              style={{
                width: "70px",
                height: "70px",
                objectFit: "contain",
                transform: "translateY(1.5px)",
              }}
            />
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily:
                'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
              fontWeight: 600,
              fontSize: "28px",
              lineHeight: "34px",
              letterSpacing: "-1px",
              color: "#1D1D1D",
              textAlign: "center",
              maxWidth: "296px",
              margin: 0,
            }}
          >
            Explore all of our vendors
          </h2>

          {/* CTA pill — same design as SoftwareSection */}
          <div
            style={{
              width: "229px",
              height: "61px",
              background: "rgba(176, 255, 159, 0.2)",
              borderRadius: "100px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Link
              href="/softwares"
              className="relative flex flex-row items-center justify-center overflow-hidden"
              style={{
                width: "217px",
                height: "49px",
                background: "linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)",
                boxShadow:
                  "0px 5px 23px rgba(214,253,112,0.3), inset -4px -4px 8px rgba(255,255,255,0.3), inset 4px 4px 8px rgba(255,255,255,0.3)",
                borderRadius: "100px",
                padding: "12px 54px 12px 30px",
                isolation: "isolate",
                textDecoration: "none",
                gap: "10px",
              }}
            >
              {/* Decorative left circle */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: "32px",
                  height: "32px",
                  left: "-47.71px",
                  top: "1.87px",
                  background: "#FFFFFF",
                  borderRadius: "100px",
                  transform: "rotate(-45deg)",
                  zIndex: 0,
                }}
              >
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  aria-hidden
                  style={{ transform: "rotate(-45deg)" }}
                >
                  <path
                    d="M1 4H11M8 1L11 4L8 7"
                    stroke="#1D1D1D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span
                style={{
                  fontFamily: "var(--font-sora), Sora, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "23px",
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                  position: "relative",
                  zIndex: 0,
                }}
              >
                Explore all
              </span>

              {/* Right arrow circle */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: "32px",
                  height: "32px",
                  left: "176.08px",
                  top: "8.5px",
                  background: "#FFFFFF",
                  borderRadius: "100px",
                  zIndex: 2,
                }}
              >
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 4H11M8 1L11 4L8 7"
                    stroke="#1D1D1D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Hills / grass image — anchored to bottom, z between icons and center ── */}
        <img
          src="/hills-bg.png"
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: "290px",
            objectFit: "cover",
            objectPosition: "top",
            zIndex: 1,
          }}
        />
      </section>
    </div>
  );
}
