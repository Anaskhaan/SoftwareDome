'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '@/assets/icons';

const navLinks = [
  { name: 'Explore', href: '/categories' },
  { name: 'Trends', href: '/top-software' },
  { name: 'Deals', href: '/deals' },
  { name: 'Blog', href: '/blog' },
];

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
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

      <div className="hidden lg:flex items-center gap-4 relative">
        {user ? (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="w-10 h-10 cursor-pointer rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy hover:bg-primary-navy/20 transition-all border border-primary-navy/10">
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
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
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
        ) : (
          <>
            <Link href="/login" className="btn text-gray-700 hover:bg-gray-50 text-sm">
              Login
            </Link>
            <Link href="/signup" className="btn btn-navy text-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
