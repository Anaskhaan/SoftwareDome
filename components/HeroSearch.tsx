'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { findBestCategoryForQuery } from '@/app/dashboard/softwares/actions';

const chips = [
  { label: 'CRM Software',  value: 'CRM'  },
  { label: 'HR Software',   value: 'HR'   },
  { label: 'EMR Software',  value: 'EMR'  },
  { label: 'LMS Software',  value: 'LMS'  },
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) { router.push('/categories'); return; }
    const res = await findBestCategoryForQuery(term);
    if (res.success && res.data) {
      router.push(`/categories/${res.data.categorySlug}?q=${encodeURIComponent(term)}`);
    } else {
      router.push('/categories');
    }
  };

  return (
    /*
     * Frame 8 — 672.47 × 150 px, flex-col, items-center, gap: 16px
     * On mobile: full width with px padding
     */
    <div
      className="flex flex-col items-center"
      style={{ width: 'min(672.47px, 100%)', gap: '16px' }}
    >
      {/* ── Frame 2: chips + label ── */}
      <div className="flex flex-col items-center" style={{ gap: '14px' }}>

        {/* "Not sure where to start?" */}
        <span
          style={{
            fontFamily: 'var(--font-sora), Sora, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            textAlign: 'center',
            color: 'rgba(17, 17, 17, 0.6)',
          }}
        >
          Not sure where to start?
        </span>

        {/* Frame 3: chip row */}
        <div className="flex flex-wrap justify-center" style={{ gap: '10px' }}>
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={`/categories?q=${encodeURIComponent(chip.value)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '34px',
                padding: '6px 16px',
                background: 'rgba(255, 255, 255, 0.48)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '50px',
                fontFamily: 'var(--font-sora), Sora, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '20px',
                textAlign: 'center',
                color: '#2F6C25',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Search bar container ── */}
      {/*
       * 672.47 × 66 px, rgba(255,255,255,0.7), border-radius 110px,
       * box-shadow, backdrop-filter, padding 10px 9px
       */}
      <form
        onSubmit={handleSearch}
        className="flex w-full flex-row items-center"
        style={{
          height: '66px',
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(47, 108, 37, 0.01)',
          boxShadow: '0px 4px 34px rgba(17, 17, 17, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '110px',
          padding: '10px 9px',
        }}
      >
        {/* Text input — 563.47 × 44 px, padding 12px 0 12px 16px */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search software, category, or service.."
          style={{
            flex: 1,
            height: '44px',
            padding: '12px 0 12px 16px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-sora), Sora, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '20px',
            color: '#111111',
          }}
          className="placeholder-[rgba(159,159,169,0.67)]"
        />

        {/* Search button — 89 × 44, lime gradient, border-radius 100px */}
        <button
          type="submit"
          style={{
            flexShrink: 0,
            width: '89px',
            height: '44px',
            background: 'linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)',
            boxShadow:
              '0px 5px 23px rgba(214, 253, 112, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.3), inset 4px 4px 8px rgba(255, 255, 255, 0.3)',
            borderRadius: '100px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-sans), Geist, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '20px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          Search
        </button>
      </form>
    </div>
  );
}
