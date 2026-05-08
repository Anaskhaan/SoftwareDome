import SectionHeader from './SectionHeader';
import { Icons } from '@/assets/icons';

const workflow = [
  { id: '01', name: 'Discovery', desc: 'Understanding your vision, goals, and business requirements in depth.' },
  { id: '02', name: 'Strategy', desc: 'Defining a technological roadmap and architectural blueprint.' },
  { id: '03', name: 'Development', desc: 'Crafting high-performance code with precision and modern best practices.' },
  { id: '04', name: 'Deployment', desc: 'Seamlessly launching your solution to the world with full support.' },
];

export default function ProductCards() {
  return (
    <div>
      <SectionHeader
        title="Our Process"
        subtitle="HOW WE WORK"
      />

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-11 gap-0 items-stretch min-h-[550px]">
          {/* Step 1 */}
          <article className="md:col-span-3 self-start bg-white border border-zinc-200 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary-navy/20 transition-all cursor-pointer group flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="skeleton-number mb-6">
                {workflow[0].id}
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-2">{workflow[0].name}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{workflow[0].desc}</p>
            </div>
          </article>

          {/* Arrow 1: Down-Right */}
          <div className="hidden md:flex md:col-span-1 self-center h-20 z-10">
            <svg className="w-full h-full text-zinc-300" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
              <path d="M85,100 L100,100 L100,85" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Step 2 */}
          <article className="md:col-span-3 self-end bg-white border border-zinc-200 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary-navy/20 transition-all cursor-pointer group flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="skeleton-number mb-6">
                {workflow[1].id}
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-2">{workflow[1].name}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{workflow[1].desc}</p>
            </div>
          </article>

          {/* Arrow 2: Up-Right */}
          <div className="hidden md:flex md:col-span-1 self-center h-20 z-10">
            <svg className="w-full h-full text-zinc-300" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
              <path d="M85,0 L100,0 L100,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Step 3 */}
          <article className="md:col-span-3 self-start bg-white border border-zinc-200 p-8 rounded-lg shadow-sm hover:shadow-xl hover:border-primary-navy/20 transition-all cursor-pointer group flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="skeleton-number mb-6">
                {workflow[2].id}
              </div>
              <h3 className="text-xl font-bold text-primary-navy mb-2">{workflow[2].name}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{workflow[2].desc}</p>
            </div>
          </article>
      </div>
    </div>
  );
}
