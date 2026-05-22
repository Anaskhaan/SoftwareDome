import SectionHeader from './SectionHeader';
import { Search, GitCompare, FileCheck, CircleCheck } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="[&_header]:mb-5">
        <SectionHeader
          title="From first search to final shortlist."
          subtitle="HOW IT WORKS"
        />
      </div>

      {/* Bridge band — continues About without another hero block */}
      <div className="flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 rounded-sm">
        <p className="max-w-2xl text-sm font-medium leading-snug text-primary-navy">
          The mission section covers how listings enter the dome. Here is how teams move through
          what you have already published.
        </p>
        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-400">
          <span className="h-px w-6 bg-zinc-300" aria-hidden />
          <span>Buyer path</span>
        </div>
      </div>

      {/* Alternating timeline — skeleton numbers + zigzag offset, editorial shell */}
      <div className="overflow-hidden rounded-sm border border-zinc-200">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/50">
            Discovery flow
          </span>
        </div>

        <div className="relative divide-y divide-zinc-100 bg-white">
          <div
            className="pointer-events-none absolute left-[1.65rem] top-6 bottom-6 hidden w-px bg-zinc-200 sm:block"
            aria-hidden
          />

          {journey.map((step, index) => {
            const Icon = step.icon;
            const offset = index % 2 === 1;

            return (
              <article
                key={step.id}
                className={`relative flex flex-col gap-3 p-4 sm:flex-row sm:gap-5 sm:p-5 ${
                  offset ? 'sm:pl-16 lg:pl-28' : 'sm:pl-5'
                }`}
              >
                <div className="flex items-start gap-4 sm:w-[42%] sm:shrink-0 lg:w-[38%]">
                  <div className="skeleton-number text-[3.25rem] leading-none sm:text-[4.5rem]">
                    {step.id}
                  </div>
                  <Icon
                    size={15}
                    strokeWidth={2.25}
                    className="mt-2 shrink-0 text-primary-navy/45 sm:hidden"
                    aria-hidden
                  />
                </div>

                <div className={`flex flex-1 flex-col gap-1.5 ${offset ? 'sm:items-end sm:text-right' : ''}`}>
                  <div className={`flex items-center gap-2 ${offset ? 'sm:flex-row-reverse' : ''}`}>
                    <h3 className="text-base font-bold text-primary-navy sm:text-lg">{step.name}</h3>
                    <Icon
                      size={14}
                      strokeWidth={2.25}
                      className="hidden shrink-0 text-primary-navy/45 sm:block"
                      aria-hidden
                    />
                  </div>
                  <p className="max-w-md text-xs leading-relaxed text-zinc-500 sm:text-sm">{step.desc}</p>
                </div>

                {index < journey.length - 1 && (
                  <div
                    className={`pointer-events-none absolute hidden h-8 w-8 border-zinc-200 sm:block ${
                      offset
                        ? 'bottom-0 left-16 border-b border-l lg:left-28'
                        : 'bottom-0 right-8 border-b border-r lg:right-16'
                    }`}
                    aria-hidden
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-500">
        <span className="font-semibold text-primary-navy">SoftwareDome</span> keeps discovery and
        listing operations in one visual language — catalog above, path below, footer to close.
      </p>
    </div>
  );
}
