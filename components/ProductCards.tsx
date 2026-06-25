import SectionHeader from './SectionHeader';
import { Search, GitCompare, FileCheck, CircleCheck } from '@/lib/fa-icons';

const journey = [
  {
    id: '01',
    name: 'Explore',
    desc: 'Browse the live catalog by category, region, or keyword — every listing admin-approved.',
    icon: Search,
  },
  {
    id: '02',
    name: 'Compare',
    desc: 'Stack tools side by side on fit, pricing signals, and category — without leaving SoftwareDome.',
    icon: GitCompare,
  },
  {
    id: '03',
    name: 'Verify',
    desc: 'Read curated metadata and positioning written for clarity, not sponsored rankings.',
    icon: FileCheck,
  },
  {
    id: '04',
    name: 'Decide',
    desc: 'Shortlist with confidence and share choices with your team — no pay-to-play noise.',
    icon: CircleCheck,
  },
];

export default function ProductCards() {
  return (
    <div className="space-y-8 xl:space-y-10">
      <SectionHeader title="From first search to final shortlist." subtitle="HOW IT WORKS" />

      {/* Bridge band */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border-subtle bg-surface-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-2xl text-sm font-medium leading-snug text-primary-navy">
          The mission section covers how listings enter the dome. Here is how teams move through
          what you have already published.
        </p>
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-green-800">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
          <span>Buyer path</span>
        </div>
      </div>

      {/* Connected step grid */}
      <div className="rounded-3xl border border-border-subtle bg-white p-6 sm:p-7 xl:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-green-800">
            Discovery flow
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-wider text-text-muted sm:inline">
            Step-by-step
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
          {journey.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="group relative">
                {index < journey.length - 1 && (
                  <div
                    className="absolute left-6 top-6 hidden h-px w-[calc(100%-1.5rem)] bg-gradient-to-r from-brand-green/50 to-transparent lg:block"
                    aria-hidden
                  />
                )}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green to-brand-green-dark text-white shadow-[0_10px_24px_-8px_rgba(95,194,74,0.55)] transition-transform duration-300 group-hover:-translate-y-1">
                  <Icon size={18} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-navy text-[10px] font-bold text-white ring-2 ring-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-brand text-base font-bold text-primary-navy">{step.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-text-muted">
        <span className="font-semibold text-primary-navy">SoftwareDome</span> keeps discovery and
        listing operations in one visual language — catalog above, path below, footer to close.
      </p>
    </div>
  );
}
