# Hero Dynamic Floating Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero section's 4 hardcoded floating logo cards with real, top-rated software logos pulled from already-fetched homepage data, rotating automatically on each ISR regeneration (~every 10 minutes) with zero added network requests and no client-side JS.

**Architecture:** A pure selection function (`lib/hero-floating-cards.ts`, no React/Next imports so it can be exercised by a standalone `tsx` verification script) filters the homepage's already-fetched software list to rated+logoed rows, takes the top 15 by rating, randomly picks 4, and maps them onto the 4 existing fixed card positions — falling back to the current static icons per-slot if too few software rows qualify. `components/Hero.tsx` accepts a new optional `softwares` prop and calls this function at render time; `app/page.tsx` passes its existing `softwares` variable through, unchanged in every other respect.

**Tech Stack:** Next.js 16 (App Router, server components), TypeScript, `next/image`. No new npm dependency.

## Global Constraints

- No new npm dependency; no changes to `next.config.ts`'s global image security settings (SVG opt-out is handled per-`<Image>` via the `unoptimized` prop, not globally).
- No changes to the 4 existing card positions/rotations (`left`, `top`, `rotate` per slot) or their responsive size classes (`w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-32 xl:h-32`).
- No changes to `trustedLogos` / the marquee strip, `app/dashboard/softwares/actions.ts`, the `Software` Prisma model, or the page's `revalidate = 600` ISR setting.
- This repo has no automated test framework (no jest/vitest/playwright). Verification uses standalone scripts under `scripts/`, run via `npx tsx scripts/<name>.ts`, using `node:assert/strict` for hard failures — following the precedent of `scripts/verify-blog-content.ts`.
- The selection must run at server-render time with no client component conversion (no `useEffect`, no `"use client"` added to `Hero.tsx` or `app/page.tsx`) — this is what makes the rotation piggyback on the existing ISR cycle instead of firing per-visitor.

---

## Task 1: `lib/hero-floating-cards.ts` — pure selection logic

**Files:**
- Create: `lib/hero-floating-cards.ts`
- Create: `scripts/verify-hero-floating-cards.ts`

**Interfaces:**
- Produces: `type SoftwareForCard = { id: string; name: string; logo: string | null; rating: number | null }`, `type FloatingCard = { left: string; top: string; rotate: string; src: string; alt: string }`, `pickFloatingCards(softwares: SoftwareForCard[] | undefined): FloatingCard[]`.
- Consumed by: Task 2 (`components/Hero.tsx`).

- [ ] **Step 1: Write `lib/hero-floating-cards.ts`**

```ts
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
```

- [ ] **Step 2: Write the verification script**

Create `scripts/verify-hero-floating-cards.ts`:

```ts
import assert from "node:assert/strict";
import { pickFloatingCards, type SoftwareForCard } from "@/lib/hero-floating-cards";

function makeSoftware(count: number): SoftwareForCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `sw-${i}`,
    name: `Software ${i}`,
    logo: `https://res.cloudinary.com/demo/software-${i}.png`,
    rating: 5 - i * 0.1,
  }));
}

function main() {
  // Normal dataset: 20 qualifying rows
  const normal = pickFloatingCards(makeSoftware(20));
  assert.equal(normal.length, 4, "should always return exactly 4 cards");
  const srcs = normal.map((c) => c.src);
  assert.equal(new Set(srcs).size, 4, "should not repeat the same software twice");
  for (const card of normal) {
    assert.ok(
      card.src.startsWith("https://res.cloudinary.com/"),
      "should use a real software logo, not a fallback icon"
    );
    assert.ok(card.alt.endsWith(" logo"), "alt text should describe the software");
  }

  // Small dataset: only 2 qualifying rows -> 2 real + 2 fallback
  const small = pickFloatingCards(makeSoftware(2));
  assert.equal(small.length, 4, "should still return exactly 4 cards");
  const realCount = small.filter((c) =>
    c.src.startsWith("https://res.cloudinary.com/")
  ).length;
  const fallbackCount = small.filter((c) => c.src.startsWith("/heroIcon")).length;
  assert.equal(realCount, 2, "should use both qualifying software rows");
  assert.equal(fallbackCount, 2, "should fill remaining slots with fallback icons");

  // Empty/undefined dataset -> all fallback, never crashes
  const empty = pickFloatingCards(undefined);
  assert.equal(empty.length, 4, "should still return exactly 4 cards with no data");
  assert.ok(
    empty.every((c) => c.src.startsWith("/heroIcon")),
    "should use fallback icons when no software qualifies"
  );

  // Rows with rating<=0 or missing logo must be excluded
  const mixed = pickFloatingCards([
    { id: "a", name: "No Rating", logo: "https://res.cloudinary.com/demo/a.png", rating: 0 },
    { id: "b", name: "No Logo", logo: null, rating: 4.9 },
    { id: "c", name: "Qualifies", logo: "https://res.cloudinary.com/demo/c.png", rating: 4.5 },
  ]);
  const mixedRealSrcs = mixed
    .map((c) => c.src)
    .filter((s) => s.startsWith("https://res.cloudinary.com/"));
  assert.deepEqual(
    mixedRealSrcs,
    ["https://res.cloudinary.com/demo/c.png"],
    "should exclude unrated and logo-less rows"
  );

  // Fixed slot positions/rotations must be preserved regardless of which software fills them
  const positions = pickFloatingCards(makeSoftware(20)).map(
    (c) => `${c.left}|${c.top}|${c.rotate}`
  );
  assert.deepEqual(
    positions,
    ["4.05%|40%|-8deg", "91.2%|35%|10deg", "6.11%|58%|6deg", "89.2%|55%|-10deg"],
    "card positions/rotations must stay fixed regardless of which software is picked"
  );

  console.log("All hero floating-card selection checks passed.");
}

main();
```

- [ ] **Step 3: Run the verification script**

Run: `npx tsx scripts/verify-hero-floating-cards.ts`
Expected: `All hero floating-card selection checks passed.`, exit code 0. If any `assert` throws, fix `lib/hero-floating-cards.ts` until it passes — do not change the expected values (they encode the approved design's fixed positions and fallback behavior).

- [ ] **Step 4: Commit**

```bash
git add lib/hero-floating-cards.ts scripts/verify-hero-floating-cards.ts
git commit -m "feat: add hero floating-card selection logic"
```

---

## Task 2: Wire dynamic cards into Hero and the homepage

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `pickFloatingCards`, `type SoftwareForCard` from `@/lib/hero-floating-cards` (Task 1).

- [ ] **Step 1: Update imports and remove the static `floatingCards` array in `components/Hero.tsx`**

Replace:
```tsx
import HeroSearch from "@/components/HeroSearch";
import NavWrapper from "@/components/NavWrapper";
import Image from "next/image";
```
with:
```tsx
import HeroSearch from "@/components/HeroSearch";
import NavWrapper from "@/components/NavWrapper";
import Image from "next/image";
import { pickFloatingCards, type SoftwareForCard } from "@/lib/hero-floating-cards";
```

Delete the entire `const floatingCards = [ ... ];` block (the array of 4 objects with `src`, `name`, `left`, `top`, `rotate` — it sits between the `trustedLogos` array and `export default function Hero()`). `trustedLogos` itself is untouched.

- [ ] **Step 2: Accept the `softwares` prop and use `pickFloatingCards`**

Replace:
```tsx
export default function Hero() {
```
with:
```tsx
export default function Hero({ softwares }: { softwares?: SoftwareForCard[] }) {
```

Replace:
```tsx
        {/* Floating decorative cards — absolute, visible at every breakpoint, scaled down on small screens */}
        {floatingCards.map((card) => (
          <div
            key={card.name}
            aria-hidden
            className="pointer-events-none absolute flex"
            style={{ left: card.left, top: card.top }}
          >
            <Image
              src={card.src}
              alt="software vendor logo"
              width={100}
              height={100}
              className="object-contain w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-32 xl:h-32"
              style={{ transform: `rotate(${card.rotate})` }}
            />
          </div>
        ))}
```
with:
```tsx
        {/* Floating decorative cards — absolute, visible at every breakpoint, scaled down on small screens.
            Sourced from top-rated software and re-picked on each ISR regeneration (~every 10 min). */}
        {pickFloatingCards(softwares).map((card, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute flex"
            style={{ left: card.left, top: card.top }}
          >
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

- [ ] **Step 3: Pass `softwares` into `Hero` from `app/page.tsx`**

Replace:
```tsx
      <Hero />
```
with:
```tsx
      <Hero softwares={softwares} />
```

`app/page.tsx` already computes `softwares` above this point (`const res = await getSoftwares(); const softwares = res.success && res.data ? res.data : [];`) — no other change needed in this file.

- [ ] **Step 4: Verify types and build**

Run: `npx tsc --noEmit`
Expected: no errors (in particular, no error at the `<Hero softwares={softwares} />` call site — `getSoftwares()`'s returned rows structurally satisfy `SoftwareForCard`, since `Software` includes `id: string`, `name: string`, `logo: string | null`, `rating: number | null` alongside its other fields).

Run: `npm run build`
Expected: build completes successfully (exit 0), including `/` (the homepage route using `Hero`).

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, open `/`.
Expected: the 4 floating cards show real software logos (not the old `heroIcon1-4.webp` stock icons) with rotation/position unchanged from before. Reload a few times — since the pick only changes on ISR regeneration (~every 10 minutes), you will likely see the *same* 4 logos across reloads within that window; this is expected, not a bug. Confirm no broken image icons (this specifically exercises the `.svg`-logo `unoptimized` path, since several top-rated software use `.svg` logos).

- [ ] **Step 6: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: source hero floating cards from top-rated software"
```

---

## Task 3: Repo-wide lint and build check

**Files:** none (verification only)

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no new errors from `lib/hero-floating-cards.ts`, `components/Hero.tsx`, or `app/page.tsx`. This repo has pre-existing lint errors/warnings unrelated to this change (baseline, not introduced here) — only flag and fix issues in the three files this plan touches.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: build completes successfully (exit 0).

- [ ] **Step 3: Commit**

Only if Step 1 required fixes:
```bash
git add -A
git commit -m "fix: address lint issues from hero floating-card changes"
```
If no fixes were needed, there is nothing to commit for this task.

---

## Self-Review Notes

- **Spec coverage:** reusing `app/page.tsx`'s already-fetched data (Task 2, Step 3), top-15-by-rating random pick with ISR-cycle rotation (Task 1), per-image SVG `unoptimized` opt-out (Task 2, Step 2), fixed positions/rotations preserved (Task 1's `FIXED_SLOTS`, asserted in Task 1's verify script), fallback to static icons when too few rows qualify (Task 1's `FALLBACK_ICONS`, asserted in Task 1's verify script) — every spec requirement maps to a task.
- **Placeholder scan:** no TBDs; every step has literal code or an exact command with expected output.
- **Type consistency:** `SoftwareForCard` and `FloatingCard` are defined once in Task 1 and imported (not redefined) in Task 2; `pickFloatingCards(softwares: SoftwareForCard[] | undefined): FloatingCard[]` signature matches its only call site in Task 2 exactly.
