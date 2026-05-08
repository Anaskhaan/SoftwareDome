import { Icons } from '@/assets/icons';
import SectionHeader from './SectionHeader';

export default function AboutSection() {
  return (
    <>
      <SectionHeader
        title="The Verification Layer for SaaS."
        subtitle="OUR MISSION"
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

        {/* Left Column: The Big Why */}
        <article className="md:col-span-6 flex flex-col gap-8">
          <p className="text-zinc-500 leading-relaxed">
            In an industry flooded with biased reviews and sponsored rankings, we verify the truth. Our platform serves as the final filter before you commit to your next piece of critical technology.
          </p>

          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="text-2xl font-black text-primary-navy">48</div>
              <div className="text-sm font-semibold text-zinc-400 uppercase tracking-widest leading-tight">
                Point Security <br /> Verification
              </div>
            </div>
            <hr className="h-10 w-[1px] bg-zinc-200" />
            <div className="flex items-center gap-4 group cursor-default">
              <div className="text-2xl font-black text-primary-navy">12k+</div>
              <div className="text-sm font-semibold text-zinc-400 uppercase tracking-widest leading-tight">
                Products <br /> Audited Monthly
              </div>
            </div>
          </div>
        </article>

        {/* Right Column: Sleek Value Points */}
        <article className="md:col-span-6 flex flex-col gap-12">
          <div className="flex gap-6 items-start group">
            <div className="p-3 rounded-xl bg-primary-navy text-white shadow-xl shadow-primary-navy/20 group-hover:scale-110 transition-transform">
              <Icons.Security size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-primary-navy">Unbiased Audits</h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                We don't accept sponsorships for rankings. Our data is purely derived from technical audits and verified user feedback loops.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start group">
            <div className="p-3 rounded-xl bg-zinc-100 text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-all">
              <Icons.Speed size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-primary-navy">Instant Context</h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Skip the sales calls. Get instant, objective data on performance, security compliance, and actual TCO for any software in our directory.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start group">
            <div className="p-3 rounded-xl bg-zinc-100 text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-all">
              <Icons.Modular size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-primary-navy">Redundancy Check</h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Founders save an average of $2,400 per seat annually by identifying overlapping feature sets in their existing tech stack.
              </p>
            </div>
          </div>


        </article>
      </div>
    </>
  );
}
