export type SoftwareForCard = {
  id: string;
  name: string;
  logo: string | null;
  rating: number | null;
};

export type FloatingCard = {
  left: string;
  top: string;
  rotate: string;
  src: string;
  alt: string;
};

const FIXED_SLOTS: { left: string; top: string; rotate: string }[] = [
  { left: "4.05%", top: "40%", rotate: "-8deg" },
  { left: "91.2%", top: "35%", rotate: "10deg" },
  { left: "6.11%", top: "58%", rotate: "6deg" },
  { left: "89.2%", top: "55%", rotate: "-10deg" },
];

const FALLBACK_ICONS: { src: string; alt: string }[] = [
  { src: "/heroIcon1.webp", alt: "ModMed logo" },
  { src: "/heroIcon2.webp", alt: "athenahealth logo" },
  { src: "/heroIcon3.webp", alt: "RXNT logo" },
  { src: "/heroIcon4.webp", alt: "UKG logo" },
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickFloatingCards(
  softwares: SoftwareForCard[] | undefined
): FloatingCard[] {
  const qualifying = (softwares ?? [])
    .filter((sw) => (sw.rating ?? 0) > 0 && !!sw.logo)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 15);

  const picked = shuffle(qualifying).slice(0, 4);

  return FIXED_SLOTS.map((slot, i) => {
    const sw = picked[i];
    if (sw) {
      return { ...slot, src: sw.logo as string, alt: `${sw.name} logo` };
    }
    const fallback = FALLBACK_ICONS[i];
    return { ...slot, src: fallback.src, alt: fallback.alt };
  });
}
