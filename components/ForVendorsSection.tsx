"use client";

import { ArrowRight } from "@/lib/fa-icons";
import { useInView } from "@/hooks/useInView";
import Button from "@/components/Button";

/* ── Static chart values — no Math.random(), SSR-safe ── */
const BARS = [
  { h: 18 }, { h: 28 }, { h: 20 }, { h: 36 },
  { h: 24 }, { h: 30 }
];

/* Donut — r=22, circumference ≈ 138.2 */
const DONUT_R = 22;
const DONUT_C = 2 * Math.PI * DONUT_R;
const DONUT_PCT = 0.88; // 88% from the reference image

export default function ForVendorsSection({ showHeader = true }: { showHeader?: boolean }) {
  const { ref, visible } = useInView(0.05);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center w-full"
      style={{ gap: "40px" }}
    >
      {/* ── Header Container ── */}
      {showHeader && (
        <div
          className="flex flex-col items-center text-center w-full"
          style={{ gap: "16px" }}
        >
          <div className="flex flex-col items-center" style={{ gap: "8px" }}>
            {/* GET LEADS */}
            <span
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "28px",
                textTransform: "uppercase",
                color: "#2F6C25",
                letterSpacing: "0.05em",
              }}
            >
              Get Leads
            </span>
            {/* Are you a vendor? */}
            <h2
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 46px)",
                lineHeight: "clamp(36px, 5.5vw, 60px)",
                letterSpacing: "-1.04px",
                color: "#23252C",
                margin: 0,
              }}
            >
              Are you a vendor?
            </h2>
          </div>
          {/* Description from reference image */}
          <p
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(15px, 1.8vw, 20px)",
              lineHeight: "32px",
              color: "#54565B",
              maxWidth: "762px",
              margin: 0,
            }}
          >
            SoftwareDome keeps discovery and listing operations in one visual language catalog above, path below, footer to close.
          </p>
        </div>
      )}

      {/* ── Cards Container ── */}
      <div
        className="flex flex-col lg:flex-row items-center justify-center w-full"
        style={{ gap: "50px", marginTop: "16px" }}
      >
        {/* ── Card 1: Get More Leads ── */}
        <div
          className={`flex flex-col sm:flex-row items-stretch justify-between overflow-hidden bg-white shadow-[0px_20px_60px_-12px_rgba(10,25,47,0.18)] border border-black/5 transition-all duration-700 w-full lg:w-[550px] lg:h-[255px]`}
          style={{
            borderRadius: "24px",
            transform: visible ? "translateY(0)" : "translateY(32px)",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Left Column: Text & Button */}
          <div
            className="flex flex-col justify-between items-start flex-1 p-8 h-full"
            style={{ boxSizing: "border-box", minHeight: "200px" }}
          >
            <div className="flex flex-col items-start" style={{ gap: "10px" }}>
              <h3
                style={{
                  fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: "26px",
                  letterSpacing: "-0.33px",
                  color: "#0A192F",
                  margin: 0,
                }}
              >
                Get More Leads
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sora), Sora, sans-serif",
                  fontWeight: 400,
                  fontSize: "13.5px",
                  lineHeight: "22px",
                  color: "#5B6B63",
                  margin: 0,
                }}
              >
                Get sales-ready leads without the wait
              </p>
            </div>

            <Button
              href="/login?mode=signup&role=VENDOR"
              variant="dark"
              icon={ArrowRight}
              iconPosition="right"
              style={{ fontFamily: "var(--font-sora), Sora, sans-serif" }}
            >
              Get Sales - Ready Leads
            </Button>
          </div>

          {/* Right Column: Interactive Illustration */}
          <div
            className="flex items-center justify-center w-full sm:w-[214px] shrink-0 p-6 sm:p-0"
            style={{ boxSizing: "border-box" }}
          >
            {/* Stats card matching reference image style */}
            <div
              className="flex flex-row items-center justify-between border border-[#e7ede6] rounded-2xl p-4 bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.04)]"
              style={{
                width: "192px",
                height: "130px",
                boxSizing: "border-box",
                gap: "8px",
              }}
            >
              {/* Left Side: Stats + Bar Chart */}
              <div className="flex flex-col justify-between h-full flex-1">
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-sora), Sora, sans-serif",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#94A3B8",
                      margin: 0,
                    }}
                  >
                    Total Leads
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#0A192F",
                      margin: "2px 0 0 0",
                      lineHeight: 1.1,
                    }}
                  >
                    96.6k
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-sora), Sora, sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "#48A637",
                      margin: "1px 0 0 0",
                    }}
                  >
                    +2.8%
                  </p>
                </div>

                {/* Minimized Bar chart */}
                <div className="flex items-end gap-0.5 h-7">
                  {BARS.map(({ h }, i) => (
                    <div
                      key={i}
                      className="relative flex-1 rounded bg-[#5fc24a]/10"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded bg-[#5fc24a] transition-all duration-700"
                        style={{
                          height: visible ? `${h * 0.7}px` : 0,
                          transitionDelay: `${180 + i * 40}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Donut chart */}
              <div className="shrink-0 flex items-center justify-center relative">
                <svg width="48" height="48" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r={DONUT_R} fill="none" stroke="#e7ede6" strokeWidth="6" />
                  <circle
                    cx="36" cy="36" r={DONUT_R} fill="none" stroke="#072929" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${DONUT_C * DONUT_PCT} ${DONUT_C}`}
                    transform="rotate(-90 36 36)"
                    style={{
                      transition: "stroke-dasharray 1s ease",
                      strokeDasharray: visible ? `${DONUT_C * DONUT_PCT} ${DONUT_C}` : `0 ${DONUT_C}`,
                      transitionDelay: "400ms",
                    }}
                  />
                  <text
                    x="36"
                    y="40"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#0a192f"
                    style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif' }}
                  >
                    88%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: List Your Software ── */}
        <div
          className={`flex flex-col sm:flex-row items-stretch justify-between overflow-hidden bg-white shadow-[0px_20px_60px_-12px_rgba(10,25,47,0.18)] border border-black/5 transition-all duration-700 w-full lg:w-[550px] lg:h-[255px]`}
          style={{
            borderRadius: "24px",
            transform: visible ? "translateY(0)" : "translateY(32px)",
            opacity: visible ? 1 : 0,
            transitionDelay: "100ms",
          }}
        >
          {/* Left Column: Text & Button */}
          <div
            className="flex flex-col justify-between items-start flex-1 p-8 h-full"
            style={{ boxSizing: "border-box", minHeight: "200px" }}
          >
            <div className="flex flex-col items-start" style={{ gap: "10px" }}>
              <h3
                style={{
                  fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: "26px",
                  letterSpacing: "-0.33px",
                  color: "#0A192F",
                  margin: 0,
                }}
              >
                List Your Software
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sora), Sora, sans-serif",
                  fontWeight: 400,
                  fontSize: "13.5px",
                  lineHeight: "22px",
                  color: "#5B6B63",
                  margin: 0,
                }}
              >
                Make your software stand out
              </p>
            </div>

            <Button
              href="/login?mode=signup&role=VENDOR"
              variant="dark"
              icon={ArrowRight}
              iconPosition="right"
              style={{ fontFamily: "var(--font-sora), Sora, sans-serif" }}
            >
              List Now & Get Seen!
            </Button>
          </div>

          {/* Right Column: Stacked App Icons + Profile Card */}
          <div
            className="flex flex-row items-center justify-center w-full sm:w-[214px] shrink-0 p-6 sm:p-0"
            style={{ boxSizing: "border-box", gap: "12px" }}
          >
            {/* 3 Vertically Stacked Icons */}
            <div className="flex flex-col gap-2 shrink-0">
              {/* Icon 1: SoftwareDome logo */}
              <div
                className="flex items-center justify-center bg-[#072929] rounded-lg shadow-sm"
                style={{ width: "32px", height: "32px" }}
              >
                <img
                  src="/logomark.svg"
                  alt=""
                  style={{ width: "18px", height: "18px", objectFit: "contain" }}
                />
              </div>
              {/* Icon 2: Asana-like flower logo */}
              <div
                className="flex items-center justify-center bg-[#FCE4EC] rounded-lg shadow-sm"
                style={{ width: "32px", height: "32px" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8.2" r="2.8" fill="#F4511E" />
                  <circle cx="8" cy="3.5" r="2" fill="#FF8A65" />
                  <circle cx="3.8" cy="10.8" r="2" fill="#FF8A65" />
                  <circle cx="12.2" cy="10.8" r="2" fill="#FF8A65" />
                </svg>
              </div>
              {/* Icon 3: Monday-like colored bars */}
              <div
                className="flex items-center justify-center bg-[#FFF3E0] rounded-lg shadow-sm"
                style={{ width: "32px", height: "32px" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2.5" y="5.5" width="2" height="7" rx="0.8" transform="rotate(-25 2.5 5.5)" fill="#FF3D57" />
                  <rect x="6.2" y="3.5" width="2" height="9" rx="0.8" transform="rotate(-25 6.2 3.5)" fill="#FFCB00" />
                  <rect x="9.9" y="1.5" width="2" height="11" rx="0.8" transform="rotate(-25 9.9 1.5)" fill="#00D647" />
                </svg>
              </div>
            </div>

            {/* Profile Info Float Card */}
            <div
              className="flex flex-col justify-between border border-[#e7ede6] rounded-2xl p-3 bg-white shadow-[0px_8px_24px_rgba(0,0,0,0.04)] overflow-hidden"
              style={{
                width: "150px",
                height: "130px",
                boxSizing: "border-box",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#0A192F",
                    margin: 0,
                  }}
                >
                  Software Dome
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    fontSize: "7.5px",
                    color: "#94A3B8",
                    margin: "2px 0 0 0",
                    lineHeight: "10px",
                    height: "20px",
                    overflow: "hidden",
                  }}
                >
                  Experiencing challenges with asset management and...
                </p>

                {/* Micro tags */}
                <div className="flex gap-1 mt-1.5">
                  <span
                    style={{
                      fontSize: "6px",
                      fontWeight: 600,
                      background: "#F1F5F9",
                      color: "#475569",
                      padding: "2px 4px",
                      borderRadius: "100px",
                      fontFamily: "var(--font-sora), Sora, sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Time Tracking
                  </span>
                  <span
                    style={{
                      fontSize: "6px",
                      fontWeight: 600,
                      background: "#F1F5F9",
                      color: "#475569",
                      padding: "2px 4px",
                      borderRadius: "100px",
                      fontFamily: "var(--font-sora), Sora, sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Task Mgmt
                  </span>
                </div>
              </div>

              {/* Sparkline chart at the bottom */}
              <div style={{ margin: "0 -12px -12px -12px" }}>
                <svg width="100%" height="24" viewBox="0 0 150 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 18C15 15 25 21 40 16C55 11 65 14 80 8C95 2 110 9 150 2" stroke="#FF7A45" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0 18C15 15 25 21 40 16C55 11 65 14 80 8C95 2 110 9 150 2V24H0V18Z" fill="url(#orange-grad)" opacity="0.15" />
                  <defs>
                    <linearGradient id="orange-grad" x1="75" y1="2" x2="75" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7A45" />
                      <stop offset="1" stopColor="#FF7A45" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
