'use client';

import { useState, useEffect } from 'react';
import { getSoftwares } from '@/app/dashboard/softwares/actions';

const floatingSlots = [
  { top: '42%', left: '6%', rotate: -8 },
  { top: '34%', left: '93%', rotate: 10 },
  { top: '68%', left: '8%', rotate: 6 },
  { top: '62%', left: '91%', rotate: -10 },
];

const LOGO_CYCLE_MS = 3000;

export default function HeroFloatingChips() {
  const [productLogos, setProductLogos] = useState<{ id: string; name: string; logo: string }[]>([]);
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    getSoftwares().then((res) => {
      if (res.success && res.data) {
        setProductLogos(
          res.data
            .filter((s: any) => s.logo)
            .map((s: any) => ({ id: s.id, name: s.name, logo: s.logo as string }))
        );
      }
    });
  }, []);

  useEffect(() => {
    if (productLogos.length <= 1) return;
    const interval = setInterval(() => {
      setCycleIndex((i) => (i + 1) % productLogos.length);
    }, LOGO_CYCLE_MS);
    return () => clearInterval(interval);
  }, [productLogos.length]);

  return (
    <>
      {floatingSlots.map((slot, i) => {
        const product = productLogos.length
          ? productLogos[(cycleIndex + i) % productLogos.length]
          : null;
        return (
          <div
            key={i}
            className="absolute flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/20 lg:h-16 lg:w-16"
            style={{
              top: slot.top,
              left: slot.left,
              transform: `translate(-50%, -50%) rotate(${slot.rotate}deg)`,
            }}
          >
            {product && (
              <img
                key={product.id}
                src={product.logo}
                alt={product.name}
                width={40}
                height={40}
                className="anim-fade-in h-9 w-9 object-contain lg:h-10 lg:w-10"
              />
            )}
          </div>
        );
      })}
      <div
        className="absolute right-[10%] top-[78%] h-7 w-7 text-brand-green-light/70"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full animate-pulse">
          <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
        </svg>
      </div>
    </>
  );
}
