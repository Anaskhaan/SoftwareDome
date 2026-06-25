'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/assets/icons';
import Logo from '@/components/Logo';
import { findBestCategoryForQuery } from '@/app/dashboard/softwares/actions';

const navLinks = [
  { name: 'Software Categories', href: '/categories' },
  { name: 'For Vendors', href: '/vendors' },
  { name: 'Resource Center', href: '/blog' },
  { name: 'Write a Review', href: '/write-review' },
] as const;

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    onClose();
    if (!term) { router.push('/categories'); return; }
    const res = await findBestCategoryForQuery(term);
    if (res.success && res.data) {
      router.push(`/categories/${res.data.categorySlug}?q=${encodeURIComponent(term)}`);
    } else {
      router.push('/categories');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    onClose();
    router.push('/login');
    router.refresh();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-[#0c221a] transition-all duration-500 ease-in-out ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Logo size="md" variant="dark" />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          <Icons.Close size={18} />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-5 pt-5">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-brand-green/40">
            <Icons.Search size={15} className="shrink-0 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search software…"
              className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </form>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex flex-col mt-4 px-2 flex-1 overflow-y-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white border-b border-white/5 last:border-0"
          >
            {link.name}
            <Icons.Arrow size={14} className="text-white/30" />
          </Link>
        ))}
      </nav>

      {/* ── Bottom CTA ── */}
      <div className="px-5 pb-8 pt-4 border-t border-white/10">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-brand-green-light">
                <Icons.User size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{user.name || 'Account'}</p>
                <p className="truncate text-xs text-white/40">{user.email}</p>
              </div>
            </div>
            {(user.role === 'ADMIN' || user.role === 'VENDOR') && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="w-full rounded-xl border border-white/15 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-white/5"
              >
                {user.role === 'VENDOR' ? 'Vendor Panel' : 'Dashboard'}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20"
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_-4px_rgba(95,194,74,0.5)] transition-all hover:bg-brand-green-dark"
          >
            <Icons.User size={15} />
            Join Free or Log In
          </Link>
        )}
      </div>
    </div>
  );
}
