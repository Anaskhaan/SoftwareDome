'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/assets/icons';
import Logo from '@/components/Logo';

const navLinks = [
  { name: 'Software Categories', href: '/categories' },
  { name: 'For Vendors', href: '/vendors' },
  { name: 'Resource Center', href: '/blog' },
  { name: 'Write a Review', href: '/write-review' },
];

export default function Navbar({
  onMenuClick,
  transparent = false,
  heroTheme = 'light',
}: {
  onMenuClick: () => void;
  transparent?: boolean;
  heroTheme?: 'light' | 'dark';
}) {
  const [user, setUser] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  const isBlended = transparent && !scrolled;
  const isDarkBlend = isBlended && heroTheme === 'dark';
  const darkUI = isDarkBlend || !isBlended;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header
      className={`py-2 transition-all duration-300 ${
        transparent
          ? `fixed top-0 inset-x-0 z-50 ${
              isBlended
                ? 'bg-transparent border-b border-transparent'
                : 'bg-[#0c221a] border-b border-[#0c221a] shadow-[0_8px_30px_-8px_rgba(10,25,47,0.25)]'
            }`
          : 'sticky top-0 z-40 bg-[#0c221a] backdrop-blur-xl border-b border-[#0c221a] shadow-[0_1px_0_rgba(10,25,47,0.1)]'
      }`}
    >
    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-10 lg:px-20">
      <Logo size="md" variant={darkUI ? 'dark' : 'light'} />

      <nav
        className={`hidden md:flex items-center gap-1 font-semibold text-sm transition-colors ${
          darkUI ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`rounded-full px-3.5 py-2 whitespace-nowrap transition-colors ${
              darkUI
                ? 'hover:bg-white/10 hover:text-white'
                : 'hover:bg-brand-green/8 hover:text-brand-green-dark'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={onMenuClick}
          className={`md:hidden flex items-center justify-center rounded-lg p-1.5 transition-colors ${
            darkUI ? 'text-white hover:bg-white/10' : 'text-primary-navy hover:bg-primary-navy/5'
          }`}
          aria-label="Open menu"
        >
          <Icons.Menu size={24} />
        </button>
        <div className="hidden md:flex items-center gap-2">
        <Link
          href="/categories"
          aria-label="Search"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
            darkUI
              ? 'border-white/15 text-white/80 hover:bg-white/10 hover:text-white'
              : 'border-transparent text-gray-500 hover:bg-brand-green/8 hover:text-brand-green-dark'
          }`}
        >
          <Icons.Search size={18} />
        </Link>

        {user ? (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`w-10 h-10 cursor-pointer rounded-full flex items-center justify-center transition-all border hover:ring-2 hover:ring-brand-green/30 ${
                darkUI
                  ? 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                  : 'bg-primary-navy/10 text-primary-navy border-primary-navy/10 hover:bg-primary-navy/20'
              }`}
            >
              <Icons.User size={20} />
            </button>

            {showTooltip && (
              <div
                className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(10,25,47,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  >
                    View Profile
                  </Link>
                  {user.role === 'ADMIN' || user.role === 'VENDOR' ? (
                    <Link
                      href="/dashboard"
                      title={
                        user.role === 'VENDOR'
                          ? 'Vendor panel — manage your software listings and profile'
                          : 'Admin dashboard'
                      }
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      {user.role === 'VENDOR' ? 'Vendor Panel' : 'Dashboard'}
                    </Link>
                  ) : null}
                  <div className="h-px bg-gray-100 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : darkUI ? (
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-green/50 px-5 py-2 text-sm font-bold text-brand-green-light transition-all hover:border-brand-green hover:bg-brand-green/10"
          >
            <Icons.User size={15} />
            Join Free or Log In
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-1.5 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] transition-all hover:bg-brand-green-dark hover:shadow-[0_6px_20px_-2px_rgba(95,194,74,0.55)] hover:-translate-y-0.5"
            >
              Get Started
              <Icons.Arrow size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </>
        )}
        </div>
      </div>

    </div>
    </header>
  );
}
