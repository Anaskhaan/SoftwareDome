import Link from 'next/link';

export default function Hero() {
  return (
    <div className="grid grid-cols-12 gap-y-12 lg:gap-x-12 items-center overflow-hidden">
      <article className="col-span-12 lg:col-span-7 grid grid-cols-1 gap-6 text-center lg:text-left">
        <header className="grid grid-cols-1 gap-2">
          <span className="text-primary-navy font-bold tracking-[0.3em] text-[10px] uppercase opacity-50">The Ultimate Directory</span>
          <h1 className="text-4xl font-black leading-[1.1] text-primary-navy tracking-tighter">
            Discover the Best <br />
            <span className="text-gray-400">SaaS Tools</span> for You.
          </h1>
        </header>

        <p className="text-md text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
          SoftwareDome is the #1 platform to find, compare, and review top-rated products. Built for founders, by founders.
        </p>

        <footer className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 max-w-md mx-auto lg:mx-0">
          <Link href="/explore" className="btn btn-navy text-base">
            Explore Tools
          </Link>
          <Link href="/submit" className="btn border-2 border-primary-navy text-primary-navy hover:bg-primary-navy hover:text-white transition-all text-base">
            Submit Product
          </Link>
        </footer>
      </article>

      <figure className="col-span-12 lg:col-span-5 relative grid grid-cols-1">
        <img
          src="/hero.png"
          alt="Software Illustration"
          className="w-full h-auto rounded-lg shadow-xl lg:transform lg:scale-105"
        />
      </figure>
    </div>
  );
}
