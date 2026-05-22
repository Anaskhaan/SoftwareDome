import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const indexPreview = [
  { code: 'ANA', sector: 'Analytics', slots: '142' },
  { code: 'DEV', sector: 'DevTools', slots: '89' },
  { code: 'CRM', sector: 'CRM', slots: '76' },
  { code: 'SEC', sector: 'Security', slots: '54' },
  { code: 'HRX', sector: 'HR & Ops', slots: '61' },
];

const paths = [
  {
    label: 'Enter catalog',
    href: '#catalog',
    note: 'Browse approved listings',
  },
  {
    label: 'List your product',
    href: '/submit',
    note: 'Submit for admin review',
  },
  {
    label: 'Open dashboard',
    href: '/dashboard',
    note: 'Curate the global index',
  },
];

const sectors = ['Analytics', 'DevTools', 'CRM', 'Security', 'HR', 'Finance', 'AI', 'Infra'];

export default function Hero() {
  return (
    <section
      className="relative min-h-[calc(100dvh-4.5rem)] border-b border-white/10 bg-primary-navy text-white"
      aria-label="SoftwareDome home"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-7xl flex-col px-6 lg:px-20">
        {/* Meta rail */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
            <span>SoftwareDome</span>
            <span className="hidden h-3 w-px bg-white/20 sm:inline" aria-hidden />
            <span className="text-white/70">Global software index</span>
          </div>
         
        </div>

        {/* Main surface */}
        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-12 lg:gap-6 lg:py-10">
          {/* Architectural type — not a marketing slogan block */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="mb-4 max-w-md text-sm leading-relaxed text-white/55">
              The first screen is the index itself — vendors worldwide, one dome, admin-curated
              entries, zero paid rank slots.
            </p>
            <div className="select-none leading-[0.82] tracking-tighter">
              <span className="block text-[clamp(2.75rem,11vw,7.5rem)] font-black text-white">
                WORLD
              </span>
              <span className="block text-[clamp(2.75rem,11vw,7.5rem)] font-black text-white/90">
                SOFTWARE
              </span>
              <span
                className="block text-[clamp(2.75rem,11vw,7.5rem)] font-black text-transparent"
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.28)' }}
              >
                DOME
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5">
              <div>
                <div className="text-lg font-black tabular-nums">∞</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Coverage goal
                </div>
              </div>
              <div>
                <div className="text-lg font-black tabular-nums">01</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Unified catalog
                </div>
              </div>
              <div>
                <div className="text-lg font-black tabular-nums">0</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Sponsored ranks
                </div>
              </div>
            </div>
          </div>

          {/* Live index panel */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="overflow-hidden rounded-sm border border-white/15 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                  Index preview
                </span>
                <span className="font-mono text-[10px] text-white/30">v1.0</span>
              </div>
              <ul className="divide-y divide-white/8">
                {indexPreview.map((row) => (
                  <li key={row.code}>
                    <Link
                      href="#catalog"
                      className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="w-8 shrink-0 font-mono text-[10px] font-bold text-white/35">
                        {row.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85 group-hover:text-white">
                        {row.sector}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/35">
                        {row.slots}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/60"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 px-3 py-2">
                <Link
                  href="#catalog"
                  className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
                >
                  View full catalog →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Entry paths — editorial cells, not hero CTAs */}
        <div className="grid gap-px overflow-hidden rounded-sm border border-white/15 bg-white/15 pb-px sm:grid-cols-3">
          {paths.map((path) => (
            <Link
              key={path.label}
              href={path.href}
              className="group flex flex-col gap-1 bg-primary-navy px-4 py-3.5 transition-colors hover:bg-white/[0.06] sm:px-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">{path.label}</span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70"
                  aria-hidden
                />
              </div>
              <span className="text-[11px] text-white/45">{path.note}</span>
            </Link>
          ))}
        </div>

        {/* Sector tape — leads eye into DISCOVER below */}
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 py-4 font-mono text-[10px] uppercase tracking-wider text-white/35">
          <span className="text-white/50">Sectors</span>
          {sectors.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-white/20">/</span>}
              <Link href="#catalog" className="transition-colors hover:text-white/70">
                {s}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
