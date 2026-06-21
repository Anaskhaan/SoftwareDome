import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

type Row = Record<string, string | number | null>;

function splitArr(v: string | number | null): string[] {
  if (!v) return [];
  return String(v).split("|").map((s) => s.trim()).filter(Boolean);
}

function parseJson(v: string | number | null) {
  if (!v) return undefined;
  return JSON.parse(String(v));
}

async function main() {
  const file = path.join(process.cwd(), "data", "ehr-emr-software-seed.json");
  const rows: Row[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  for (const row of rows) {
    const data = {
      name: String(row.name),
      slug: String(row.slug),
      logo: row.logo ? String(row.logo) : null,
      website: row.website ? String(row.website) : null,
      category: row.category ? String(row.category) : null,
      rating: row.rating ? Number(row.rating) : 0,
      reportUrl: row.reportUrl ? String(row.reportUrl) : null,
      introduction: row.introduction ? String(row.introduction) : null,
      ourVerdict: row.ourVerdict ? String(row.ourVerdict) : null,
      keyTakeaways: splitArr(row.keyTakeaways),
      pros: splitArr(row.pros),
      cons: splitArr(row.cons),
      pictures: splitArr(row.pictures),
      howItWorks: row.howItWorks ? String(row.howItWorks) : null,
      whoIsItFor: row.whoIsItFor ? String(row.whoIsItFor) : null,
      howItIsDifferent: row.howItIsDifferent ? String(row.howItIsDifferent) : null,
      sentiments: row.sentiments ? String(row.sentiments) : null,
      specifications: parseJson(row.specifications),
      faqs: parseJson(row.faqs),
    };

    await prisma.software.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
    console.log(`Upserted: ${data.name}`);
  }

  console.log(`Done. Seeded ${rows.length} software records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
