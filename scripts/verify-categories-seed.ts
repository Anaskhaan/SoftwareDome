import assert from "node:assert/strict";
import prisma from "@/lib/prisma";

async function main() {
  const categoryCount = await prisma.category.count();
  assert.ok(
    categoryCount === 29 || categoryCount === 30,
    `Expected 29 or 30 categories (30 if the "Other Software" fallback was created), got ${categoryCount}`
  );

  const categories = await prisma.category.findMany({ include: { subcategories: true } });
  for (const category of categories) {
    const generals = category.subcategories.filter((s) => s.isGeneral);
    assert.equal(generals.length, 1, `Category "${category.name}" should have exactly one General subcategory, found ${generals.length}`);
  }

  const unassigned = await prisma.software.count({ where: { subcategoryId: null } });
  assert.equal(unassigned, 0, `Expected 0 unassigned software rows, found ${unassigned}`);

  const otherCategory = await prisma.category.findUnique({ where: { slug: "other-software" } });
  if (otherCategory) {
    const softwareInOther = await prisma.software.count({
      where: { subcategory: { categoryId: otherCategory.id, isGeneral: true } },
    });
    console.log(`Note: ${softwareInOther} software row(s) fell back to "Other Software" (unmatched old category strings).`);
  }

  const totalSubcategories = await prisma.subcategory.count();
  console.log(`OK: ${categoryCount} categories, ${totalSubcategories} subcategories, 0 unassigned software.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Verification failed:", e.message);
    process.exit(1);
  });
