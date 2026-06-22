"use server";

import { parse } from "csv-parse/sync";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";

export async function getSoftwares() {
  try {
    const softwares = await prisma.software.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: softwares };
  } catch (error) {
    console.error("Error fetching softwares:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getCategories() {
  try {
    const grouped = await prisma.software.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { category: { not: null } },
    });

    const categories = grouped
      .filter((g) => g.category && g.category.trim())
      .map((g) => ({
        name: g.category as string,
        slug: slugify(g.category as string),
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getSoftwaresByCategory(
  categorySlug: string,
  options: { page?: number; pageSize?: number } = {}
) {
  try {
    const page = Math.max(options.page || 1, 1);
    const pageSize = options.pageSize || 12;

    const allCategories = await prisma.software.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    const matchingCategories = allCategories
      .map((c) => c.category as string)
      .filter((c) => slugify(c) === categorySlug);

    if (matchingCategories.length === 0) {
      return { success: true, data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: null } };
    }

    const where = { category: { in: matchingCategories } };
    const [softwares, total] = await Promise.all([
      prisma.software.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.software.count({ where }),
    ]);

    return {
      success: true,
      data: {
        softwares,
        total,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        categoryName: matchingCategories[0],
      },
    };
  } catch (error) {
    console.error("Error fetching softwares by category:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "softwares" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    );
    uploadStream.end(buffer);
  });
}

export async function createSoftware(formData: FormData) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "";
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;

    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;
    const sentiments = formData.get("sentiments") as string;

    // Arrays
    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    // JSON fields
    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");

    if (!name) {
      return { success: false, error: "Software name is required" };
    }

    const slug = slugify(name);

    const existingSoftware = await prisma.software.findUnique({
      where: { slug },
    });

    if (existingSoftware) {
      return { success: false, error: "A software with this name/slug already exists" };
    }

    // Handle Image Uploads
    let logoUrl = "";
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadToCloudinary(logoFile);
    }

    const pictureUrls: string[] = [];
    const pictures = formData.getAll("pictures") as File[];
    for (const pic of pictures) {
      if (pic && pic instanceof File && pic.size > 0) {
        const url = await uploadToCloudinary(pic);
        pictureUrls.push(url);
      }
    }

    const software = await (prisma.software as any).create({
      data: {
        name,
        slug,
        logo: logoUrl,
        category,
        rating,
        reportUrl,
        introduction,
        ourVerdict,
        keyTakeaways,
        pros,
        cons,
        pictures: pictureUrls,
        howItWorks,
        whoIsItFor,
        howItIsDifferent,
        sentiments,
        specifications,
        faqs,
      },
    });

    return { success: true, data: software };
  } catch (error) {
    console.error("Error creating software:", error);
    return { success: false, error: "Failed to create software" };
  }
}

export async function getSoftwareById(id: string) {
  try {
    const software = await prisma.software.findUnique({
      where: { id },
    });
    return { success: true, data: software };
  } catch (error) {
    console.error("Error fetching software by ID:", error);
    return { success: false, error: "Failed to fetch software" };
  }
}

export async function updateSoftware(id: string, formData: FormData) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "";
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;

    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;
    const sentiments = formData.get("sentiments") as string;

    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");

    if (!name) {
      return { success: false, error: "Software name is required" };
    }

    const slug = slugify(name);
    const slugOwner = await prisma.software.findUnique({ where: { slug } });
    if (slugOwner && slugOwner.id !== id) {
      return { success: false, error: "A software with this name/slug already exists" };
    }

    const updateData: any = {
      name,
      slug,
      category,
      rating,
      reportUrl,
      introduction,
      ourVerdict,
      keyTakeaways,
      pros,
      cons,
      howItWorks,
      whoIsItFor,
      howItIsDifferent,
      sentiments,
      specifications,
      faqs,
    };

    // Handle Image Uploads conditionally
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      updateData.logo = await uploadToCloudinary(logoFile);
    }

    const pictureUrls: string[] = JSON.parse(formData.get("existingPictures") as string || "[]");
    const newPictures = formData.getAll("pictures") as File[];
    for (const pic of newPictures) {
      if (pic && pic instanceof File && pic.size > 0) {
        const url = await uploadToCloudinary(pic);
        pictureUrls.push(url);
      }
    }
    updateData.pictures = pictureUrls;

    const software = await (prisma.software as any).update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: software };
  } catch (error) {
    console.error("Error updating software:", error);
    return { success: false, error: "Failed to update software" };
  }
}

function cloudinaryPublicId(url: string): string {
  return url.split("/").slice(-2).join("/").replace(/\.[a-zA-Z]+$/, "");
}

export async function deleteSoftware(id: string) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const software = await prisma.software.findUnique({ where: { id } });
    if (!software) {
      return { success: false, error: "Software not found." };
    }

    const assetUrls = [software.logo, ...(software.pictures || [])].filter(Boolean) as string[];
    for (const url of assetUrls) {
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId(url));
      } catch (err) {
        console.error("Failed to remove Cloudinary asset:", url, err);
      }
    }

    await prisma.software.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting software:", error);
    return { success: false, error: "Failed to delete software" };
  }
}

export async function deleteSoftwares(ids: string[]) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    if (!ids.length) return { success: false, error: "No softwares selected." };

    const softwares = await prisma.software.findMany({ where: { id: { in: ids } } });

    for (const software of softwares) {
      const assetUrls = [software.logo, ...(software.pictures || [])].filter(Boolean) as string[];
      for (const url of assetUrls) {
        try {
          await cloudinary.uploader.destroy(cloudinaryPublicId(url));
        } catch (err) {
          console.error("Failed to remove Cloudinary asset:", url, err);
        }
      }
    }

    const result = await prisma.software.deleteMany({ where: { id: { in: ids } } });
    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error deleting softwares:", error);
    return { success: false, error: "Failed to delete softwares" };
  }
}

export async function getSoftwareBySlug(slug: string) {
  try {
    const software = await prisma.software.findUnique({
      where: { slug },
    });
    return { success: true, data: software };
  } catch (error) {
    console.error("Error fetching software by slug:", error);
    return { success: false, error: "Failed to fetch software" };
  }
}

type CsvRow = {
  name: string;
  slug: string;
  logo: string;
  category: string;
  rating: string;
  reportUrl: string;
  introduction: string;
  ourVerdict: string;
  keyTakeaways: string;
  pros: string;
  cons: string;
  pictures: string;
  howItWorks: string;
  whoIsItFor: string;
  howItIsDifferent: string;
  sentiments: string;
  specifications: string;
  faqs: string;
};

function parseJsonArray(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseJsonAny(value: string | undefined): unknown {
  if (!value || !value.trim()) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function parseJsonObject(value: string | undefined): Record<string, unknown> {
  if (!value || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function uploadFromUrl(url: string): Promise<string> {
  const res = await cloudinary.uploader.upload(url, { folder: "softwares" });
  return res.secure_url;
}

export async function importSoftwaresFromCsv(formData: FormData) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No CSV file provided." };
    }

    const content = await file.text();
    let rows: CsvRow[];
    try {
      rows = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
      });
    } catch {
      return { success: false, error: "Failed to parse CSV file." };
    }

    const existing = await prisma.software.findMany({ select: { slug: true } });
    const existingSlugs = new Set(existing.map((r) => r.slug));

    let created = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!row.name || !row.slug) continue;
      if (existingSlugs.has(row.slug)) {
        skipped++;
        continue;
      }

      try {
        const logoUrl = row.logo ? await uploadFromUrl(row.logo) : "";

        const pictureUrls: string[] = [];
        for (const pic of parseJsonArray(row.pictures)) {
          try {
            pictureUrls.push(await uploadFromUrl(pic));
          } catch (err) {
            console.error(`Picture upload failed for ${row.slug}:`, pic, err);
          }
        }

        await (prisma.software as any).create({
          data: {
            name: row.name,
            slug: row.slug,
            logo: logoUrl,
            category: row.category || "",
            rating: parseFloat(row.rating) || 0,
            reportUrl: row.reportUrl || null,
            introduction: row.introduction || null,
            ourVerdict: row.ourVerdict || null,
            keyTakeaways: parseJsonArray(row.keyTakeaways),
            pros: parseJsonArray(row.pros),
            cons: parseJsonArray(row.cons),
            pictures: pictureUrls,
            howItWorks: row.howItWorks || null,
            whoIsItFor: row.whoIsItFor || null,
            howItIsDifferent: row.howItIsDifferent || null,
            sentiments: row.sentiments || null,
            specifications: parseJsonObject(row.specifications),
            faqs: parseJsonAny(row.faqs) as any,
          },
        });

        existingSlugs.add(row.slug);
        created++;
      } catch (err) {
        console.error(`Failed to import row ${row.slug}:`, err);
        failed++;
        errors.push(row.slug);
      }
    }

    return { success: true, data: { created, skipped, failed, errors } };
  } catch (error) {
    console.error("Error importing softwares from CSV:", error);
    return { success: false, error: "Failed to import CSV" };
  }
}
