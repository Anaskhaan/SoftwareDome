import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import prisma from "@/lib/prisma";

// One-time recovery: production's Software.category column was dropped before
// its data was backfilled onto subcategoryId. These CSVs are the original
// scrape data used to populate the site, keyed by slug — this script matches
// each row back to its existing Software row by slug and sets subcategoryId,
// touching no other field.

const CSV_CATEGORY_TO_TAXONOMY_NAME: Record<string, string> = {
  crm: "CRM Software",
  "emr-software": "EMR Software",
  hr: "Human Resource Software",
};

type CsvRow = {
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: npx tsx scripts/restore-software-subcategories-from-csv.ts <file1.csv> <file2.csv> ...");
    process.exit(1);
  }

  const categories = await prisma.category.findMany({ include: { subcategories: true } });
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));

  let updated = 0;
  let alreadySet = 0;
  let noMatchingSlug = 0;
  let unresolvedCategory = 0;
  const unresolvedSamples: string[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const rows: CsvRow[] = parse(raw, { columns: true, skip_empty_lines: true });
    console.log(`\n=== ${path.basename(file)}: ${rows.length} rows ===`);

    let fileUpdated = 0;
    let fileNoSlug = 0;
    let fileUnresolved = 0;

    for (const row of rows) {
      if (!row.slug) continue;

      const taxonomyName = CSV_CATEGORY_TO_TAXONOMY_NAME[row.category?.trim()];
      if (!taxonomyName) {
        unresolvedCategory++;
        fileUnresolved++;
        if (unresolvedSamples.length < 10) unresolvedSamples.push(`${row.slug} (category="${row.category}")`);
        continue;
      }
      const category = categoryByName.get(taxonomyName.toLowerCase());
      if (!category) {
        unresolvedCategory++;
        fileUnresolved++;
        continue;
      }

      let subcategoryId: string | null = null;
      if (row.subCategory?.trim()) {
        const wantedSlug = slugify(row.subCategory);
        const match = category.subcategories.find(
          (s) => s.slug === wantedSlug || s.name.toLowerCase() === row.subCategory!.trim().toLowerCase()
        );
        if (match) subcategoryId = match.id;
      }
      if (!subcategoryId) {
        const general = category.subcategories.find((s) => s.isGeneral);
        subcategoryId = general?.id ?? null;
      }
      if (!subcategoryId) {
        unresolvedCategory++;
        fileUnresolved++;
        continue;
      }

      const existing = await prisma.software.findUnique({ where: { slug: row.slug }, select: { id: true, subcategoryId: true } });
      if (!existing) {
        noMatchingSlug++;
        fileNoSlug++;
        continue;
      }
      if (existing.subcategoryId) {
        alreadySet++;
        continue;
      }

      await prisma.software.update({ where: { id: existing.id }, data: { subcategoryId } });
      updated++;
      fileUpdated++;
    }

    console.log(`  updated: ${fileUpdated}, no matching production slug: ${fileNoSlug}, unresolved category: ${fileUnresolved}`);
  }

  const stillUnassigned = await prisma.software.count({ where: { subcategoryId: null } });

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Already had a subcategoryId (skipped): ${alreadySet}`);
  console.log(`CSV rows with no matching production slug: ${noMatchingSlug}`);
  console.log(`CSV rows with unresolved category (sample):`, unresolvedSamples);
  console.log(`Production Software rows still unassigned after this run: ${stillUnassigned}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
