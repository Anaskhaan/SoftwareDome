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
