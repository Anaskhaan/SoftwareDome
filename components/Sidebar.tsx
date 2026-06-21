import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/assets/icons';

const navLinks = [
  { name: 'Software Categories', href: '/categories', icon: 'Categories' },
  { name: 'For Vendors', href: '/vendors', icon: 'Trending' },
  { name: 'Resource Center', href: '/blog', icon: 'Blog' },
  { name: 'Write a Review', href: '/write-review', icon: 'Deals' },
] as const;

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    router.push(query.trim() ? `/categories?q=${encodeURIComponent(query.trim())}` : '/categories');
  };

  return (
    <aside className={`fixed inset-0 z-50 transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      <button
        className={`absolute inset-0 bg-primary-navy/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close menu"
      />

      <nav className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="flex items-center justify-between mb-6">
          <span className="text-xl font-black text-primary-navy">MENU</span>
          <button onClick={onClose} className="text-primary-navy hover:rotate-90 transition-transform">
            <Icons.Close size={28} />
          </button>
        </header>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 focus-within:border-brand-green/50">
            <Icons.Search size={16} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search software…"
              className="w-full bg-transparent text-sm text-primary-navy placeholder-gray-400 outline-none"
            />
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <Link
            href="/signup"
            onClick={onClose}
            className="btn btn-green w-full text-center py-3.5 mb-5 shadow-lg shadow-brand-green/25"
          >
            Join Free or Log In
          </Link>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = Icons[link.icon as keyof typeof Icons] as any;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-center gap-4 text-base font-bold text-gray-500 hover:text-brand-green-dark border-b border-gray-50 py-4 transition-all"
                >
                  <span className="p-2 rounded-lg bg-gray-50 group-hover:bg-brand-green/10 transition-colors">
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-10">
          <p className="text-xs font-bold text-gray-300 uppercase mb-4">SoftwareDome v1.0</p>
        </div>
      </nav>
    </aside>
  );
}
