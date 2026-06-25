import SectionHeader from './SectionHeader';
import { Globe2, LayoutDashboard, ShieldCheck, Compass } from '@/lib/fa-icons';

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
    <div className="space-y-8 xl:space-y-10">
      <SectionHeader title="The world's software, indexed under one dome." subtitle="OUR MISSION" />

      {/* Manifesto — brand gradient banner */}
      <div className="relative overflow-hidden rounded-3xl text-white shadow-[0_20px_50px_-20px_rgba(72,166,55,0.45)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(120deg, var(--navy-800) 0%, var(--navy-700) 45%, var(--green-700) 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-green/30 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-5 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8 lg:p-10 xl:p-12">
          <p className="max-w-3xl font-brand text-lg font-semibold leading-snug tracking-tight sm:text-2xl xl:text-[1.75rem]">
            SoftwareDome exists to enlist and organize software from every corner of the planet —
            curated by admins, discovered by teams who need the right tool, not the loudest ad.
          </p>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-brand-green-light">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green-light" aria-hidden />
            <span>Global index</span>
          </div>
        </div>
      </div>

      {/* Bento: mission block + pillar cards */}
      <div className="grid gap-4 lg:grid-cols-12 xl:gap-5">
        <article className="flex flex-col justify-between gap-6 rounded-3xl border border-border-subtle bg-surface-muted p-6 sm:p-7 lg:col-span-4 xl:p-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-green-800">
              Why we build
            </span>
            <h3 className="mt-2 font-brand text-xl font-bold leading-tight text-primary-navy sm:text-2xl">
              A catalog built for coverage, not clicks.
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-text-muted">
            Fragmented review sites and pay-to-play directories hide great products. We mirror
            softwarefinder's clarity with our own pipeline: vendors offer listings, you approve them,
            buyers explore a single trustworthy index.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border-subtle pt-5">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="font-brand text-2xl font-bold tabular-nums text-primary-navy">{m.value}</div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8 xl:gap-4">
          {pillars.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="group flex flex-col gap-3 rounded-3xl border border-border-subtle bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_16px_36px_-18px_rgba(95,194,74,0.35)] sm:p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-green-800 transition-colors group-hover:bg-brand-green group-hover:text-white">
                <Icon size={18} />
              </div>
              <h4 className="font-brand text-base font-bold text-primary-navy">{title}</h4>
              <p className="text-sm leading-relaxed text-text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Listing pipeline — connected step flow */}
      <div className="rounded-3xl border border-border-subtle bg-white p-6 sm:p-7 xl:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-green-800">
            Listing pipeline
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-wider text-text-muted sm:inline">
            Vendor → Admin → Catalog → Buyer
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
          {pipeline.map((item, i) => (
            <div key={item.step} className="relative">
              {i < pipeline.length - 1 && (
                <div
                  className="absolute left-5 top-10 hidden h-px w-[calc(100%-1.25rem)] bg-gradient-to-r from-brand-green/50 to-transparent lg:block"
                  aria-hidden
                />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-navy font-brand text-sm font-bold text-white ring-4 ring-brand-green/15">
                {item.step}
              </div>
              <h4 className="mt-3 font-brand text-base font-bold text-primary-navy">{item.label}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing line */}
      <p className="max-w-4xl text-sm leading-relaxed text-text-muted">
        <span className="font-semibold text-primary-navy">SoftwareDome</span> is your verification
        layer and discovery surface: grow the catalog from the dashboard, and let the world find
        what you have approved.
      </p>
    </div>
  );
}
