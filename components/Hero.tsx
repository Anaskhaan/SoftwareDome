'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck } from '@/lib/fa-icons';
import Container from '@/components/Container';

const floatingBadges = [
  { top: '42%', left: '6%', bg: '#A78BFA', label: '360', rotate: -8 },
  { top: '34%', left: '93%', bg: '#7DD3FC', label: 'SAP', rotate: 10 },
  { top: '68%', left: '8%', bg: '#67E8F9', label: 'CRM', rotate: 6 },
  { top: '62%', left: '91%', bg: '#86EFAC', label: 'EMR', rotate: -10 },
];

const vendorLogos = [
  { name: 'Paychex', src: '/vendors/paychex.avif' },
  { name: 'athenahealth', src: '/vendors/athenahealth.avif' },
  { name: 'HubSpot', src: '/vendors/hubspot.avif' },
  { name: 'Absorb LMS', src: '/vendors/absorb.avif' },
  { name: 'monday.com', src: '/vendors/monday.avif' },
  { name: 'ModMed', src: '/vendors/modmed.avif' },
  { name: 'ADP Workforce Now', src: '/vendors/adp.avif' },
  { name: 'RXNT', src: '/vendors/rxnt.avif' },
  { name: 'UKG', src: '/vendors/ukg.avif' },
  { name: 'isolved', src: '/vendors/isolved.avif' },
  { name: 'Houzz Pro', src: '/vendors/houzz.avif' },
  { name: 'Epicor', src: '/vendors/epicor.avif' },
];

const vendorRow1 = vendorLogos.slice(0, 6);
const vendorRow2 = vendorLogos.slice(6);

export default function Hero() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/categories?q=${encodeURIComponent(query.trim())}` : '/categories');
  };

  return (
    <section className="relative bg-white" aria-label="SoftwareDome home">
      {/* Dark credibility band */}
      <div
        className="relative flex min-h-[560px] flex-col justify-center overflow-hidden pb-20 pt-32 lg:min-h-[620px] lg:pb-24 lg:pt-36"
        style={{
          background: 'radial-gradient(120% 100% at 50% 0%, #0f2b22 0%, #081813 55%, #050f0c 100%)',
        }}
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
          aria-hidden
        />
        {/* Green glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-green/15 blur-[100px]"
          aria-hidden
        />

        {/* Floating product chips — decorative, hidden on small screens */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          {floatingBadges.map((b, i) => (
            <div
              key={i}
              className="absolute flex h-14 w-14 items-center justify-center rounded-2xl text-xs font-black text-primary-navy/80 shadow-2xl ring-1 ring-white/20 lg:h-16 lg:w-16"
              style={{
                top: b.top,
                left: b.left,
                backgroundColor: b.bg,
                transform: `translate(-50%, -50%) rotate(${b.rotate}deg)`,
              }}
            >
              {b.label}
            </div>
          ))}
          <div
            className="absolute right-[10%] top-[78%] h-7 w-7 text-brand-green-light/70"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full animate-pulse">
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
          </div>
        </div>

        <Container className="relative text-center">
          <h1 className="mx-auto max-w-2xl font-brand text-[clamp(2rem,5.5vw,3.25rem)] font-bold leading-[1.12] tracking-tight text-white">
            Find the Right <span className="text-brand-green-light">Software</span> for Your{' '}
            <span className="text-brand-green-light">Business</span>—Faster
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            Save time comparing software options, make decisions based on unbiased reviews, and get
            expert advice — all under one dome.
          </p>

          {/* Floating search bar, overlapping into the white band below */}
          <form onSubmit={handleSearch} className="relative z-10 mx-auto mt-10 max-w-2xl lg:mt-12">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]">
              <Search size={18} className="ml-3 shrink-0 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Software, Category, Service.."
                className="w-full bg-transparent py-3 text-sm text-primary-navy placeholder-zinc-400 outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark"
              >
                Search
              </button>
            </div>
          </form>
        </Container>
      </div>

      {/* Trusted-by wall */}
      <div className="relative bg-white pb-16 pt-10">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
          <ShieldCheck size={14} className="text-brand-green" />
          Trusted by Top Vendors
        </div>

        {/* Mobile: two-row infinite marquee, opposite directions */}
        <div className="space-y-4 overflow-hidden sm:hidden">
          {[vendorRow1, vendorRow2].map((row, rowIdx) => (
            <div key={rowIdx} className="relative overflow-hidden">
              <div
                className={`marquee-track items-center gap-10 ${rowIdx === 1 ? 'marquee-track-reverse' : ''}`}
                style={{ animationDuration: rowIdx === 1 ? '24s' : '28s' }}
              >
                {[...row, ...row].map((vendor, i) => (
                  <img
                    key={`${vendor.name}-${i}`}
                    src={vendor.src}
                    alt={vendor.name}
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
              <div key={vendor.name} className="flex items-center justify-center">
                <img
                  src={vendor.src}
                  alt={vendor.name}
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
