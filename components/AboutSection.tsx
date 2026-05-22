import SectionHeader from './SectionHeader';
import { Globe2, LayoutDashboard, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

const pipeline = [
  { step: '01', label: 'Intake', detail: 'Vendors submit products from any region via our dashboard.' },
  { step: '02', label: 'Curate', detail: 'Admins verify listings, metadata, and positioning before publish.' },
  { step: '03', label: 'Publish', detail: 'Approved software enters the global SoftwareDome index.' },
  { step: '04', label: 'Discover', detail: 'Teams search, compare, and choose tools without sponsored noise.' },
];

const pillars = [
  {
    title: 'Global intake',
    body: 'Listings originate worldwide — startups, enterprises, and indie makers on one surface.',
    icon: Globe2,
  },
  {
    title: 'Admin control',
    body: 'Your dashboard is the gate: add, edit, and approve what appears in the public catalog.',
    icon: LayoutDashboard,
  },
  {
    title: 'Trusted surface',
    body: 'Every product is positioned for clarity so buyers decide on fit, not marketing fluff.',
    icon: ShieldCheck,
  },
  {
    title: 'One index',
    body: 'SoftwareDome becomes the single dome over fragmented directories and biased roundups.',
    icon: Compass,
  },
];

const metrics = [
  { value: '190+', label: 'Markets represented' },
  { value: '1', label: 'Unified catalog' },
  { value: '24/7', label: 'Living directory' },
  { value: '0', label: 'Paid rank slots' },
];

export default function AboutSection() {
  return (
    <div className="space-y-6">
      <div className="[&_header]:mb-5">
        <SectionHeader
          title="The world’s software, indexed under one dome."
          subtitle="OUR MISSION"
        />
      </div>

      {/* Manifesto strip */}
      <div className="relative overflow-hidden rounded-sm border border-primary-navy/20 bg-primary-navy text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />
        <div className="relative grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6 lg:py-6">
          <p className="max-w-3xl text-base font-semibold leading-snug tracking-tight sm:text-lg">
            SoftwareDome exists to enlist and organize software from every corner of the planet —
            curated by admins, discovered by teams who need the right tool, not the loudest ad.
          </p>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
            <span className="h-px w-8 bg-white/30" aria-hidden />
            <span>Global index</span>
          </div>
        </div>
      </div>

      {/* Bento: mission block + pillar cells (no image / no icon cards) */}
      <div className="grid overflow-hidden rounded-sm border border-zinc-200 bg-zinc-200 gap-px lg:grid-cols-12">
        <article className="flex flex-col justify-between gap-6 bg-white p-4 sm:p-5 lg:col-span-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-primary-navy/40">
              Why we build
            </span>
            <h3 className="mt-2 text-xl font-black leading-tight text-primary-navy sm:text-2xl">
              A catalog built for coverage, not clicks.
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500">
            Fragmented review sites and pay-to-play directories hide great products. We mirror
            softwarefinder’s clarity with our own pipeline: vendors offer listings, you approve them,
            buyers explore a single trustworthy index.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-100 pt-4">
            {metrics.map((m) => (
              <div key={m.label} className="min-w-[5.5rem]">
                <div className="text-lg font-black tabular-nums text-primary-navy">{m.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 lg:col-span-8">
          {pillars.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="group flex flex-col gap-2 bg-white p-4 transition-colors hover:bg-zinc-50/80 sm:p-5"
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={14}
                  strokeWidth={2.25}
                  className="shrink-0 text-primary-navy/70"
                  aria-hidden
                />
                <h4 className="text-sm font-bold text-primary-navy">{title}</h4>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">{body}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Horizontal pipeline — editorial, not zigzag cards */}
      <div className="overflow-hidden rounded-sm border border-zinc-200">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/50">
            Listing pipeline
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:inline">
            Vendor → Admin → Catalog → Buyer
          </span>
        </div>
        <div className="grid divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {pipeline.map((item, i) => (
            <article
              key={item.step}
              className="relative flex flex-col gap-1.5 bg-white px-4 py-3.5 sm:px-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-primary-navy/35">{item.step}</span>
                {i < pipeline.length - 1 && (
                  <ArrowRight
                    size={12}
                    className="hidden shrink-0 text-zinc-300 lg:block"
                    aria-hidden
                  />
                )}
              </div>
              <h4 className="text-sm font-bold text-primary-navy">{item.label}</h4>
              <p className="text-xs leading-relaxed text-zinc-500">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Closing line — typographic accent, no CTA box */}
      <p className="max-w-4xl text-sm leading-relaxed text-zinc-500">
        <span className="font-semibold text-primary-navy">SoftwareDome</span> is your verification
        layer and discovery surface: grow the catalog from the dashboard, and let the world find
        what you have approved.
      </p>
    </div>
  );
}
