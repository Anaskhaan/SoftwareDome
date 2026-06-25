"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "@/lib/fa-icons";
import Container from "@/components/Container";
import { getSoftwares, findBestCategoryForQuery } from "@/app/dashboard/softwares/actions";

const floatingSlots = [
  { top: "42%", left: "6%", rotate: -8 },
  { top: "34%", left: "93%", rotate: 10 },
  { top: "68%", left: "8%", rotate: 6 },
  { top: "62%", left: "91%", rotate: -10 },
];

const LOGO_CYCLE_MS = 3000;

const vendorLogos = [
  { name: "Paychex", src: "/vendors/paychex.avif" },
  { name: "athenahealth", src: "/vendors/athenahealth.avif" },
  { name: "HubSpot", src: "/vendors/hubspot.avif" },
  { name: "Absorb LMS", src: "/vendors/absorb.avif" },
  { name: "monday.com", src: "/vendors/monday.avif" },
  { name: "ModMed", src: "/vendors/modmed.avif" },
  { name: "ADP Workforce Now", src: "/vendors/adp.avif" },
  { name: "RXNT", src: "/vendors/rxnt.avif" },
  { name: "UKG", src: "/vendors/ukg.avif" },
  { name: "isolved", src: "/vendors/isolved.avif" },
  { name: "Houzz Pro", src: "/vendors/houzz.avif" },
  { name: "Epicor", src: "/vendors/epicor.avif" },
];

const vendorRow1 = vendorLogos.slice(0, 6);
const vendorRow2 = vendorLogos.slice(6);

const searchTabs = [
  { label: "All Software", value: "" },
  { label: "CRM", value: "CRM" },
  { label: "HR", value: "HR" },
  { label: "EMR", value: "EMR" },
  { label: "LMS", value: "LMS" },
  { label: "Project Mgmt", value: "Project Management" },
];

const quickLinks = [
  { label: "CRM Software", value: "CRM" },
  { label: "HR Software", value: "HR" },
  { label: "EMR Software", value: "EMR" },
  { label: "LMS Software", value: "LMS" },
];

export default function Hero() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(searchTabs[0].value);
  const [productLogos, setProductLogos] = useState<
    { id: string; name: string; logo: string }[]
  >([]);
  const [cycleIndex, setCycleIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function loadLogos() {
      const res = await getSoftwares();
      if (res.success && res.data) {
        setProductLogos(
          res.data
            .filter((s: any) => s.logo)
            .map((s: any) => ({ id: s.id, name: s.name, logo: s.logo as string })),
        );
      }
    }
    loadLogos();
  }, []);

  useEffect(() => {
    if (productLogos.length <= 1) return;
    const interval = setInterval(() => {
      setCycleIndex((i) => (i + 1) % productLogos.length);
    }, LOGO_CYCLE_MS);
    return () => clearInterval(interval);
  }, [productLogos.length]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = [activeTab, query.trim()].filter(Boolean).join(" ").trim();
    if (!term) {
      router.push("/categories");
      return;
    }

    const res = await findBestCategoryForQuery(term);
    if (res.success && res.data) {
      const q = query.trim();
      router.push(
        `/categories/${res.data.categorySlug}${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
    } else {
      router.push("/categories");
    }
  };

  return (
    <section className="relative bg-white" aria-label="SoftwareDome home">
      {/* Dark credibility band */}
      <div
        className="relative flex min-h-[560px] flex-col justify-center overflow-hidden pb-20 pt-32 lg:min-h-[620px] lg:pb-24 lg:pt-36"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, #0f2b22 0%, #081813 55%, #050f0c 100%)",
        }}
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
          aria-hidden
        />
        {/* Green glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-green/15 blur-[100px]"
          aria-hidden
        />

        {/* Floating product chips — decorative, hidden on small screens */}
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block"
          aria-hidden
        >
          {floatingSlots.map((slot, i) => {
            const product = productLogos.length
              ? productLogos[(cycleIndex + i) % productLogos.length]
              : null;
            return (
              <div
                key={i}
                className="absolute flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/20 lg:h-16 lg:w-16"
                style={{
                  top: slot.top,
                  left: slot.left,
                  transform: `translate(-50%, -50%) rotate(${slot.rotate}deg)`,
                }}
              >
                {product && (
                  <img
                    key={product.id}
                    src={product.logo}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="anim-fade-in h-9 w-9 object-contain lg:h-10 lg:w-10"
                  />
                )}
              </div>
            );
          })}
          <div
            className="absolute right-[10%] top-[78%] h-7 w-7 text-brand-green-light/70"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-full w-full animate-pulse"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
          </div>
        </div>

        <Container className="relative text-center">
          <h1 className="mx-auto max-w-xl  font-bold leading-[1.15] tracking-tight text-white">
            Find the right{" "}
            <span className="text-brand-green-light">software</span> from 100s
            of vendors
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            Compare unbiased reviews, pricing, and expert advice — all under one
            dome.
          </p>

          {/* Kayak-style search card: category tabs + search field, overlapping into the white band below */}
          <div className="relative z-10 mx-auto mt-8 max-w-2xl lg:mt-10">
            {/* Tab bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 px-1">
              {searchTabs.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-t-lg px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
                    tab.value !== "" && tab.value !== "EMR" ? "hidden sm:inline-flex" : ""
                  } ${
                    activeTab === tab.value
                      ? "bg-white text-primary-navy"
                      : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search software, category, or service.."
                  className="w-full bg-transparent py-3 pl-4 text-sm text-primary-navy placeholder-zinc-400 outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-900"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick browse links — fallback path when the user isn't searching for something specific */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-sm text-white/50">
              <span>Not sure where to start?</span>
              {quickLinks.map((link, i) => (
                <span
                  key={link.label}
                  className="inline-flex items-center gap-2"
                >
                  <Link
                    href={`/categories?q=${encodeURIComponent(link.value)}`}
                    className="font-semibold text-brand-green-light underline-offset-2 hover:underline"
                  >
                    {link.label}
                  </Link>
                  {i < quickLinks.length - 1 && (
                    <span className="text-white/25">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Trusted-by wall */}
      <div className="relative bg-white pb-16 pt-10">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
          <ShieldCheck size={14} className="text-brand-green" />
          Trusted by Top Vendors
        </div>

        {/* Mobile: two-row infinite marquee, opposite directions */}
        <div className="space-y-4 overflow-hidden sm:hidden">
          {[vendorRow1, vendorRow2].map((row, rowIdx) => (
            <div key={rowIdx} className="relative overflow-hidden">
              <div
                className={`marquee-track items-center gap-10 ${rowIdx === 1 ? "marquee-track-reverse" : ""}`}
                style={{ animationDuration: rowIdx === 1 ? "24s" : "28s" }}
              >
                {[...row, ...row].map((vendor, i) => (
                  <img
                    key={`${vendor.name}-${i}`}
                    src={vendor.src}
                    alt={vendor.name}
                    width={100}
                    height={28}
                    className="h-7 w-auto max-w-[100px] shrink-0 object-contain opacity-70 grayscale"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* sm and up: static grid */}
        <Container className="hidden text-center sm:block">
          <div className="mx-auto grid max-w-5xl grid-cols-4 items-center gap-x-8 gap-y-8 lg:grid-cols-6">
            {vendorLogos.map((vendor) => (
              <div
                key={vendor.name}
                className="flex items-center justify-center"
              >
                <img
                  src={vendor.src}
                  alt={vendor.name}
                  width={110}
                  height={32}
                  className="h-8 w-auto max-w-[110px] object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
