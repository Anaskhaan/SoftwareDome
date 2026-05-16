import Link from 'next/link';

export default function Hero() {
  return (
    <div className='bg-primary-navy h-[80vh] rounded-b-[25vh]'>

      <div className="grid px-6 lg:px-20 gap-y-12 lg:gap-x-12 flex-col items-center justify-center h-full">
        <article className=" flex flex-col justify-center  gap-6">
          <header className="">
            <h1 className="text-4xl font-black leading-[1.1] text-white er">
              <span className="text-gray-400">SaaS Tools</span> for You.
            </h1>
          </header>

          <p className="text-md text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            SoftwareDome is the #1 platform to find, compare, and review top-rated products. Built for founders, by founders.
          </p>

          <footer className="flex gap-4 mt-6 max-w-md mx-auto lg:mx-0">
            <Link href="/explore" className="btn btn-hero-primary">
              Explore Tools
            </Link>
            <Link href="/submit" className="btn btn-hero-outline">
              Submit Product
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
