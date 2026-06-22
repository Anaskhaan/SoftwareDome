import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uploadFromUrl(url: string): Promise<string> {
  const res = await cloudinary.uploader.upload(url, { folder: "softwares" });
  return res.secure_url;
}

// Items that map onto software already seeded — update logo only, by existing slug.
const existingUpdates: { slug: string; image: string }[] = [
  { slug: "veradigm-allscripts", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Allscripts_EMR_01_73e69cbe87.svg" },
  { slug: "drchrono", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Dr_chrono_01_dbbe674b9e.svg" },
  { slug: "oracle-health-cerner", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Cerner_EMR_01_9b44440a05.svg" },
  { slug: "eclinicalworks", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/e_Clinical_Works_01_96f695b1d1.svg" },
  { slug: "advancedmd", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Advanced_MD_01_f2c3ac8d92.svg" },
  { slug: "epic", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Epic_01_9103a37548.svg" },
  { slug: "modmed-modernizing-medicine", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Modmed_01_a10b61076b.svg" },
  { slug: "nextgen-healthcare", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/nextgen_healthcare_01_1_4e82fee13e.svg" },
  { slug: "kareo---tebra", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Tebra_01_329e5c6751.svg" },
  { slug: "athenahealth", image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Athena_Health_01_1_dae8f52253.svg" },
];

// Genuinely new EMR/EHR products not yet in the catalog.
const newSoftwares = [
  {
    name: "ChiroTouch",
    website: "https://www.chirotouch.com",
    image: "https://software-finder-prod.blr1.cdn.digitaloceanspaces.com/1_efbd98bcf3.svg",
    introduction:
      "ChiroTouch is an EHR and practice management platform built specifically for chiropractic practices, covering charting, scheduling, and billing.",
  },
  {
    name: "Pabau",
    website: "https://pabau.com",
    image: "https://software-finder-prod.blr1.cdn.digitaloceanspaces.com/Pabau_7998867bc2.svg",
    introduction:
      "Pabau is a clinic and medspa management platform combining EHR-style patient records with booking, CRM, and marketing tools for aesthetics and wellness providers.",
  },
  {
    name: "AestheticsPro",
    website: "https://www.aestheticspro.com",
    image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Aesthetics_Pro_3a87d3c146.svg",
    introduction:
      "AestheticsPro is an EHR and business management platform purpose-built for medical spas and aesthetics practices, covering charting, POS, and compliance.",
  },
  {
    name: "CounSol",
    website: "https://www.counsol.com",
    image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Coun_Sol_01_4dfca3af16.svg",
    introduction:
      "CounSol is a practice management and EHR platform for therapists and counselors, with scheduling, billing, and telehealth built around mental health workflows.",
  },
  {
    name: "Doxy.me",
    website: "https://doxy.me",
    image: "https://software-finder-prod.blr1.digitaloceanspaces.com/Doxy_me_01_fecc6e66d7.svg",
    introduction:
      "Doxy.me is a telehealth platform offering simple, browser-based video visits for healthcare providers, often used alongside an existing EHR.",
  },
];

async function main() {
  for (const item of existingUpdates) {
    const existing = await prisma.software.findUnique({ where: { slug: item.slug } });
    if (!existing) {
      console.log(`SKIP (not found): ${item.slug}`);
      continue;
    }
    const logoUrl = await uploadFromUrl(item.image);
    await prisma.software.update({ where: { slug: item.slug }, data: { logo: logoUrl } });
    console.log(`Updated logo: ${existing.name}`);
  }

  for (const item of newSoftwares) {
    const slug = slugify(item.name);
    const existing = await prisma.software.findUnique({ where: { slug } });
    if (existing) {
      console.log(`SKIP (already exists): ${item.name}`);
      continue;
    }
    const logoUrl = await uploadFromUrl(item.image);
    await prisma.software.create({
      data: {
        name: item.name,
        slug,
        category: "EHR/EMR",
        logo: logoUrl,
        introduction: item.introduction,
        rating: 0,
      },
    });
    console.log(`Created: ${item.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
