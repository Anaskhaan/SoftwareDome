'use client';

import dynamic from 'next/dynamic';

// Must live in a Client Component — next/dynamic with ssr:false is not allowed in Server Components
const HeroFloatingChips = dynamic(() => import('@/components/HeroFloatingChips'), {
  ssr: false,
  loading: () => null,
});

export default function HeroChipsLoader() {
  return <HeroFloatingChips />;
}
