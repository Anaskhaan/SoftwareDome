import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

type CategorySeed = { name: string; icon: string; subcategories: string[] };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const file = path.join(process.cwd(), "data", "categories-seed.json");
  const categoriesData: CategorySeed[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  let totalSubcategories = 0;

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const categorySlug = slugify(cat.name);

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: { name: cat.name, icon: cat.icon, order: i },
      create: { name: cat.name, slug: categorySlug, icon: cat.icon, order: i },
    });

    const generalName = `General ${cat.name}`;
    const generalSlug = slugify(generalName);
    await prisma.subcategory.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: generalSlug } },
      update: { name: generalName, isGeneral: true, order: -1 },
      create: { name: generalName, slug: generalSlug, isGeneral: true, order: -1, categoryId: category.id },
    });
    totalSubcategories++;

    for (let j = 0; j < cat.subcategories.length; j++) {
      const subName = cat.subcategories[j];
      const subSlug = slugify(subName);
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subSlug } },
        update: { name: subName, order: j },
        create: { name: subName, slug: subSlug, order: j, categoryId: category.id },
      });
      totalSubcategories++;
    }
  }

  console.log(`Seeded ${categoriesData.length} categories, ${totalSubcategories} subcategories (including General buckets).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
