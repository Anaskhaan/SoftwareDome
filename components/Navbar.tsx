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
}: {
  onMenuClick: () => void;
}) {
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
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 300);
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
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-6"
      style={{ paddingTop: '10px' }}
    >
      <header
        className="flex md:px-2 md:py-8 bg-white/20 backdrop-blur-xl shadow-lg rounded-[400px] px-3 py-1 w-full flex-col justify-center"
      >
        <div
          className="flex w-full flex-row md:h-4 md:gap-4 items-center justify-between"
        >
          {/* ── Logo ── */}
          <Logo size="sm" variant="light" />

          {/* ── Navigation — desktop only ── */}
          <nav className="hidden md:flex flex-row items-center" style={{ gap: '4px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap transition-colors hover:bg-black/5"
                style={{
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-sora), Sora, sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '20px',
                  color: 'rgba(37, 37, 37, 0.8)',
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ── Right frame ── */}
          <div className="flex flex-row items-center" style={{ gap: '10px' }}>

            {/* Mobile: hamburger only */}
            <button
              onClick={onMenuClick}
              className="md:hidden flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5"
              aria-label="Open menu"
              style={{ color: 'rgba(37,37,37,0.8)' }}
            >
              <Icons.Menu size={22} />
            </button>

            {/* Desktop: CTA + divider + user */}
            <div className="hidden md:flex items-center" style={{ gap: '10px' }}>

              {/* ── Green pill CTA button ── */}
              {/* Outer glow ring: 229×61, rgba(176,255,159,0.2), radius 100px */}
              <div
                style={{
                  width: '229px',
                  height: '61px',
                  background: 'rgba(176, 255, 159, 0.2)',
                  borderRadius: '100px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Inner pill: 217×49, lime gradient */}
                <Link
                  href="/signup"
                  className="relative flex items-center overflow-hidden"
                  style={{
                    width: '217px',
                    height: '49px',
                    background: 'linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)',
                    boxShadow:
                      '0px 5px 23px rgba(214, 253, 112, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.3), inset 4px 4px 8px rgba(255, 255, 255, 0.3)',
                    borderRadius: '100px',
                    padding: '12px 54px 12px 30px',
                  }}
                >
                  {/* Label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-sora), Sora, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '23px',
                      color: '#FFFFFF',
                      position: 'relative',
                      zIndex: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Get started now
                  </span>

                  {/* Right arrow circle: 32×32, absolute, right ~8.5px */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      right: '8.5px',
                      top: '8.5px',
                      background: '#FFFFFF',
                      borderRadius: '100px',
                      zIndex: 2,
                    }}
                  >
                    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden>
                      <path
                        d="M1 4.5H12M8.5 1L12 4.5L8.5 8"
                        stroke="#1D1D1D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              </div>

              {/* ── Vertical divider: 1px × 44px ── */}
              <div
                style={{
                  width: '1px',
                  height: '44px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  flexShrink: 0,
                }}
              />

              {/* ── User icon: 55×55 circle ── */}
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: '55px',
                      height: '55px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '171.875px',
                      flexShrink: 0,
                    }}
                  >
                    <NavUserIcon />
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
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                          View Profile
                        </Link>
                        {(user.role === 'ADMIN' || user.role === 'VENDOR') && (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                          >
                            {user.role === 'VENDOR' ? 'Vendor Panel' : 'Dashboard'}
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
                <Link
                  href="/login"
                  className="flex items-center justify-center"
                  style={{
                    width: '55px',
                    height: '55px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '171.875px',
                    flexShrink: 0,
                  }}
                >
                  <NavUserIcon />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

/* User icon — two vectors matching the Figma spec */
function NavUserIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Head — #5FC24A */}
      <circle cx="13" cy="9.5" r="3.5" fill="#5FC24A" />
      {/* Body — rgba(95,194,74,0.6) */}
      <path
        d="M5.5 22C6 17.5 9.2 14.5 13 14.5C16.8 14.5 20 17.5 20.5 22"
        stroke="rgba(95, 194, 74, 0.6)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
