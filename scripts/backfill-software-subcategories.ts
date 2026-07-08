import prisma from "@/lib/prisma";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const rows = await prisma.software.findMany({
    where: { subcategoryId: null },
    select: { id: true, category: true },
  });

  if (rows.length === 0) {
    console.log("No software rows need backfilling.");
    return;
  }

  const otherCategory = await prisma.category.upsert({
    where: { slug: "other-software" },
    update: {},
    create: { name: "Other Software", slug: "other-software", order: 9999 },
  });
  const otherGeneral = await prisma.subcategory.upsert({
    where: { categoryId_slug: { categoryId: otherCategory.id, slug: "general-other-software" } },
    update: {},
    create: {
      name: "General Other Software",
      slug: "general-other-software",
      isGeneral: true,
      order: -1,
      categoryId: otherCategory.id,
    },
  });

  const distinctOldCategories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[];
  const resolved = new Map<string, string>();

  for (const oldCategory of distinctOldCategories) {
    const targetSlug = slugify(oldCategory);
    const matchedCategory = await prisma.category.findUnique({ where: { slug: targetSlug } });
    if (matchedCategory) {
      const general = await prisma.subcategory.findFirst({
        where: { categoryId: matchedCategory.id, isGeneral: true },
      });
      resolved.set(oldCategory, (general ?? otherGeneral).id);
    } else {
      resolved.set(oldCategory, otherGeneral.id);
    }
  }

  let updated = 0;
  for (const row of rows) {
    const subcategoryId = row.category ? resolved.get(row.category) ?? otherGeneral.id : otherGeneral.id;
    await prisma.software.update({ where: { id: row.id }, data: { subcategoryId } });
    updated++;
  }

  console.log(`Backfilled ${updated} software row(s).`);
  console.log("Old category -> resolved subcategory mapping:", Object.fromEntries(resolved));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
