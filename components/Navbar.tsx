import Link from 'next/link';
import { Icons } from '@/assets/icons';

const navLinks = [
  { name: 'Explore', href: '/categories' },
  { name: 'Trends', href: '/top-software' },
  { name: 'Deals', href: '/deals' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 lg:px-16 py-5 border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-start text-primary-navy"
        >
          <Icons.Menu size={28} />
        </button>

        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="SoftwareDome Logo" 
            className="h-12 w-auto object-contain"
          />
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-10 font-semibold text-gray-600">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="hover:text-primary-navy transition-colors whitespace-nowrap"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-4">
        <Link href="/login" className="btn text-gray-700 hover:bg-gray-50 text-sm">
          Login
        </Link>
        <Link href="/signup" className="btn btn-navy text-sm">
          Get Started
        </Link>
      </div>
    </header>
  );
}
