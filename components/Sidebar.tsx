import Link from 'next/link';
import { Icons } from '@/assets/icons';

const navLinks = [
  { name: 'Home', href: '/', icon: 'Categories' },
  { name: 'Explore', href: '/categories', icon: 'Categories' },
  { name: 'Trends', href: '/top-software', icon: 'Trending' },
  { name: 'Deals', href: '/deals', icon: 'Deals' },
  { name: 'Resources', href: '/blog', icon: 'Blog' },
] as const;

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <aside className={`fixed inset-0 z-50 transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      <button
        className={`absolute inset-0 bg-primary-navy/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close menu"
      />

      <nav className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl p-8 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <header className="flex items-center justify-between mb-10">
          <span className="text-xl font-black text-primary-navy er">MENU</span>
          <button onClick={onClose} className="text-primary-navy hover:rotate-90 transition-transform">
            <Icons.Close size={32} />
          </button>
        </header>

        <div className="flex flex-col gap-2">
          {/* Action Button for Mobile */}
          <Link
            href="/join"
            onClick={onClose}
            className="btn btn-navy w-full text-center py-4 mb-6 shadow-lg shadow-primary-navy/20"
          >
            Add Product
          </Link>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = Icons[link.icon as keyof typeof Icons] as any;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="group flex items-center gap-4 text-lg font-bold text-gray-400 hover:text-primary-navy border-b border-gray-50 py-5 transition-all"
                >
                  <span className="p-2 rounded-lg bg-gray-50 group-hover:bg-primary-navy/5 transition-colors">
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-10">
          <p className="text-xs font-bold text-gray-300 uppercase  mb-4">SoftwareDome v1.0</p>
        </div>
      </nav>
    </aside>
  );
}
