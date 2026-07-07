# Hero Dynamic Floating Cards — Design Spec

**Date:** 2026-07-08
**Status:** Approved

## Problem

The Hero section (`components/Hero.tsx`) currently renders 4 decorative floating logo cards using hardcoded local image files (`/heroIcon1.webp` … `/heroIcon4.webp`), each mapped to a static vendor `name` string that isn't actually connected to any real vendor/software data. These should instead reflect real, top-rated software from the platform's own listings, and the set shown should vary over time rather than being permanently fixed — without hurting page load performance (LCP).

## Context

- `app/page.tsx` is a server component with `export const revalidate = 600` (ISR — the whole page's rendered HTML is cached and regenerated at most every 10 minutes).
- It already fetches the full software list once via `getSoftwares()` (from `app/dashboard/softwares/actions.ts`), which wraps a Prisma query (`prisma.software.findMany({ orderBy: { createdAt: "desc" } })`) in `unstable_cache` with a 60s revalidate and `["softwares"]` tag.
- That fetched array (`softwares`) is already passed as `initialData` to other homepage sections, e.g. `SoftwareSection` and `VendorsOrbitSection`.
- `VendorsOrbitSection` already establishes the precedent for client-side-style rating filtering/sorting on this same data shape: `.filter((sw) => (sw?.rating ?? 0) > 0).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))`.
- The `Software` Prisma model has the fields needed: `id`, `name`, `slug`, `logo: String?`, `rating: Float? @default(0)`.
- A live check of the current database found 45/45 software rows have both `rating > 0` and a non-null `logo` — so the "not enough qualifying software" fallback path is a defensive guard, not an expected everyday case.
- Logos are Cloudinary URLs (`https://res.cloudinary.com/drirmbeo0/...`), already whitelisted in `next.config.ts`'s `images.remotePatterns`. Several sampled logos are `.svg` files (e.g. `.../softwares/wx3ydfjprc8xahoqpwvi.svg`).
- Next.js's built-in image optimizer refuses to process remote SVGs by default (a security default — SVGs can embed scripts) unless `images.dangerouslyAllowSVG` is set globally in `next.config.ts`. This repo does not currently set that flag, and this feature should not change that global security posture just to accommodate a handful of decorative logos.

## Goals

- Floating cards show real, top-rated software logos from the platform's own data instead of hardcoded stock icons.
- The set of 4 shown software rotates automatically over time (approximately every 10 minutes, in step with the page's existing ISR revalidation), so different visits across that window can see different vendors — without adding any new database query, cache, or client-side fetch beyond what `app/page.tsx` already does today.
- No regression to LCP: no new render-blocking network request, no client-side JS added to the critical path, no layout shift versus the current static implementation.
- SVG logos render correctly despite the optimizer's default SVG restriction, without loosening `next.config.ts`'s global SVG policy.
- Graceful, non-crashing fallback if fewer than 4 software rows qualify (defensive only, not the expected path given current data).

## Non-Goals

- No live/animated rotation while a single page view is open (explicitly rejected in favor of the ISR-cycle approach, to keep this fully server-rendered with zero added client JS).
- No true per-request/per-refresh randomization (would require bypassing the page's ISR cache, adding a real-time DB query per visitor — rejected as worse for performance).
- No changes to the `Software` Prisma schema, the `getSoftwares()` action, or `next.config.ts`'s global image security settings.
- No changes to the 4 existing card positions/rotations (`left`, `top`, `rotate` per slot) or their responsive sizing (`w-9 h-9 sm:w-12 ... xl:w-32 xl:h-32`) — only the image `src`/`alt`/`name` shown in each slot changes.

## Design

### Data flow

`app/page.tsx` already computes `softwares` (the full list) before rendering. Pass that same array straight into `<Hero softwares={softwares} />` — no new fetch is introduced anywhere.

```tsx
// app/page.tsx
<Hero softwares={softwares} />
```

`Hero` becomes:

```tsx
export default function Hero({ softwares }: { softwares?: SoftwareForCard[] }) { ... }
```

where `SoftwareForCard` is a minimal local type covering only the fields Hero actually uses: `{ id: string; name: string; logo: string | null; rating: number | null }`. (The full `getSoftwares()` return type already carries these fields plus many more unrelated ones; Hero doesn't need to import or depend on the full Prisma `Software` type.)

### Selection logic

A pure helper function, colocated in `components/Hero.tsx` (no new file needed — it's small and used only here):

```ts
function pickFloatingCards(softwares: SoftwareForCard[] | undefined): FloatingCard[] {
  const qualifying = (softwares ?? [])
    .filter((sw) => (sw.rating ?? 0) > 0 && !!sw.logo)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 15); // top-15 pool by rating

  const picked = shuffle(qualifying).slice(0, 4);

  return FIXED_SLOTS.map((slot, i) => {
    const sw = picked[i];
    return sw
      ? { ...slot, src: sw.logo as string, alt: `${sw.name} logo` }
      : { ...slot, src: FALLBACK_ICONS[i].src, alt: FALLBACK_ICONS[i].alt };
  });
}
```

- `FIXED_SLOTS`: the existing 4 `{ left, top, rotate }` position definitions, extracted from the current `floatingCards` array (unchanged values).
- `FALLBACK_ICONS`: the current hardcoded `heroIcon1..4.webp` entries, kept as-is and only used per-slot if fewer than 4 qualifying software rows exist.
- `shuffle`: a small standard Fisher–Yates shuffle helper (local to this file; no new dependency).
- This function runs directly in the component body during server render — no `useEffect`, no client component conversion needed. Because `Hero` (and `app/page.tsx`) has no `"use client"` directive today and this change doesn't require adding one, the random pick happens once per server render, i.e. once per ISR regeneration (≈ every 10 minutes) rather than once per HTTP request — matching the approved "changes every ~10 min for all visitors" behavior with zero added runtime cost per visitor.

### Rendering

The existing floating-card JSX map stays structurally the same, just iterating over `pickFloatingCards(softwares)` instead of the static `floatingCards` array:

```tsx
{pickFloatingCards(softwares).map((card, i) => (
  <div key={i} aria-hidden className="pointer-events-none absolute flex" style={{ left: card.left, top: card.top }}>
    <Image
      src={card.src}
      alt={card.alt}
      width={100}
      height={100}
      unoptimized={card.src.endsWith(".svg")}
      className="object-contain w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-32 xl:h-32"
      style={{ transform: `rotate(${card.rotate})` }}
    />
  </div>
))}
```

- `key` switches from `card.name` (no longer guaranteed stable/unique across re-picks) to the slot index `i`, since the 4 DOM positions are fixed regardless of which software fills them.
- `unoptimized={card.src.endsWith(".svg")}` opts individual SVG images out of Next's image optimizer (which would otherwise reject them) while leaving raster logos (`.png`/`.jpg`) and the local fallback `.webp` icons fully optimized. This is scoped per-`<Image>`, so it doesn't touch `next.config.ts` or affect any other image in the app.
- No `priority` prop is set (matches current behavior) — these remain lazily loaded, decorative, non-LCP content; the actual LCP candidate on this page is expected to be the H1 headline text, not these small corner icons.

### Fallback behavior

If `softwares` is `undefined` (shouldn't happen given `page.tsx` always passes it, but defensively handled) or fewer than 4 rows qualify, `pickFloatingCards` fills the remaining slot(s) with the corresponding local `heroIcon*.webp` fallback — so exactly 4 cards always render, and the component never crashes or shows an empty slot.

### What doesn't change

- `trustedLogos` (the marquee strip lower in Hero) is untouched — this spec only concerns the 4 floating cards.
- Card positions, rotation angles, and responsive size classes are untouched.
- `next.config.ts` is untouched.
- No new npm dependency.

## Testing

This repo has no automated test framework; verification follows its existing convention (standalone `tsx` scripts under `scripts/`, run via `npx tsx`, using `node:assert/strict`) plus manual/build verification:

- A standalone script exercises `pickFloatingCards` (exported for testability) against: (a) a normal dataset (≥15 qualifying rows) — asserts exactly 4 cards returned, all with real software logos, no duplicates; (b) a small dataset (2 qualifying rows) — asserts 2 real + 2 fallback cards; (c) an empty/undefined dataset — asserts all 4 fallback cards, no crash.
- `npm run build` and `tsc --noEmit` must pass with no new errors.
- Manual check: reload the homepage a few times across separate ISR regenerations (or trigger revalidation manually) and confirm the 4 floating logos are real software logos (not the old static icons) and that at least one SVG-logo software renders correctly without a broken image.
