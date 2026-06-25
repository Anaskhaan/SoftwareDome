import Container from '@/components/Container';
import HeroSearch from '@/components/HeroSearch';
import HeroChipsLoader from '@/components/HeroChipsLoader';

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
  return (
    <section className="relative bg-white" aria-label="SoftwareDome home">
      {/* Dark credibility band */}
      <div
        className="relative flex min-h-[560px] flex-col justify-center overflow-hidden pb-20 pt-32 lg:min-h-[620px] lg:pb-24 lg:pt-36"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 0%, #0f2b22 0%, #081813 55%, #050f0c 100%)',
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

        {/* Floating product chips — desktop only, dynamically loaded after hydration */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
          <HeroChipsLoader />
        </div>

        <Container className="relative text-center">
          {/* Server-rendered: no hydration cost, paints immediately as LCP */}
          <h1 className="mx-auto max-w-xl font-bold leading-[1.15] tracking-tight text-white">
            Find the right{' '}
            <span className="text-brand-green-light">software</span> from 100s of vendors
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            Compare unbiased reviews, pricing, and expert advice — all under one dome.
          </p>

          {/* Interactive search — small client component, hydrates fast */}
          <HeroSearch />
        </Container>
      </div>

      {/* Trusted-by wall — pure server HTML */}
      <div className="relative bg-white pb-16 pt-10">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-600">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" className="text-brand-green" aria-hidden>
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
          Trusted by Top Vendors
        </div>

        {/* Mobile: two-row infinite marquee */}
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
                    width={100}
                    height={28}
                    loading="lazy"
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
                  width={110}
                  height={32}
                  loading="lazy"
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
