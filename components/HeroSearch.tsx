'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { findBestCategoryForQuery } from '@/app/dashboard/softwares/actions';

const searchTabs = [
  { label: 'All Software', value: '' },
  { label: 'CRM', value: 'CRM' },
  { label: 'HR', value: 'HR' },
  { label: 'EMR', value: 'EMR' },
  { label: 'LMS', value: 'LMS' },
  { label: 'Project Mgmt', value: 'Project Management' },
];

const quickLinks = [
  { label: 'CRM Software', value: 'CRM' },
  { label: 'HR Software', value: 'HR' },
  { label: 'EMR Software', value: 'EMR' },
  { label: 'LMS Software', value: 'LMS' },
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchTabs[0].value);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = [activeTab, query.trim()].filter(Boolean).join(' ').trim();
    if (!term) {
      router.push('/categories');
      return;
    }
    const res = await findBestCategoryForQuery(term);
    if (res.success && res.data) {
      const q = query.trim();
      router.push(
        `/categories/${res.data.categorySlug}${q ? `?q=${encodeURIComponent(q)}` : ''}`
      );
    } else {
      router.push('/categories');
    }
  };

  return (
    <div className="relative z-10 mx-auto mt-8 max-w-2xl lg:mt-10">
      <div className="flex flex-wrap items-center justify-center gap-1.5 px-1">
        {searchTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
              tab.value !== '' && tab.value !== 'EMR' ? 'hidden sm:inline-flex' : ''
            } ${
              activeTab === tab.value
                ? 'bg-white text-primary-navy'
                : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch}>
        <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search software, category, or service.."
            className="w-full bg-transparent py-3 pl-4 text-sm text-primary-navy placeholder-zinc-400 outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-900"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-sm text-white/50">
        <span>Not sure where to start?</span>
        {quickLinks.map((link, i) => (
          <span key={link.label} className="inline-flex items-center gap-2">
            <Link
              href={`/categories?q=${encodeURIComponent(link.value)}`}
              className="font-semibold text-brand-green-light underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
            {i < quickLinks.length - 1 && <span className="text-white/25">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
