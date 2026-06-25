"use server";

import { parse } from "csv-parse/sync";
import { unstable_cache, revalidateTag as _revalidateTag, revalidatePath } from "next/cache";
const revalidateTag = _revalidateTag as unknown as (tag: string) => void;
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";
import {
  getDashboardSession,
  isAdmin,
  requireDashboardUser,
  type DashboardSession,
} from "@/lib/require-dashboard";

const fetchSoftwares = unstable_cache(
  async () => prisma.software.findMany({ orderBy: { createdAt: "desc" } }),
  ["softwares-list"],
  { revalidate: 60, tags: ["softwares"] }
);

export async function getSoftwares() {
  try {
    const softwares = await fetchSoftwares();
    return { success: true, data: softwares };
  } catch (error) {
    console.error("Error fetching softwares:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

export async function getDashboardSoftwares() {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    const softwares = await prisma.software.findMany({
      where: isAdmin(session) ? undefined : { vendorId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: softwares };
  } catch (error) {
    console.error("Error fetching dashboard softwares:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

async function getOwnedSoftware(id: string, session: DashboardSession) {
  const software = await prisma.software.findUnique({ where: { id } });
  if (!software) {
    return { error: "Software not found." as const, software: null };
  }
  if (!isAdmin(session) && software.vendorId !== session.userId) {
    return { error: "You do not have permission to access this software." as const, software: null };
  }
  return { software, error: null };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function nameMatchScore(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return 3;
}

// Resolves a free-text search term (typed into the hero/sidebar search bars) to the
// category page it should land on: a direct category-name match wins, otherwise we
// fall back to the category of the software whose name best matches the query.
export async function findBestCategoryForQuery(query: string) {
  try {
    const q = query.trim();
    if (!q) return { success: true, data: null };

    const categoriesRes = await getCategories();
    const categories = categoriesRes.success ? categoriesRes.data || [] : [];

    const qLower = q.toLowerCase();
    const directCategory = categories.find(
      (c) => c.name.toLowerCase().includes(qLower) || qLower.includes(c.name.toLowerCase())
    );
    if (directCategory) {
      return { success: true, data: { categorySlug: directCategory.slug, categoryName: directCategory.name } };
    }

    const matches = await prisma.software.findMany({
      where: { name: { contains: q, mode: "insensitive" }, category: { not: null } },
      select: { name: true, category: true },
    });
    if (matches.length === 0) return { success: true, data: null };

    const best = matches.reduce((a, b) => (nameMatchScore(a.name, q) <= nameMatchScore(b.name, q) ? a : b));
    const matchedCategory = categories.find((c) => c.name === best.category);
    if (!matchedCategory) return { success: true, data: null };

    return { success: true, data: { categorySlug: matchedCategory.slug, categoryName: matchedCategory.name } };
  } catch (error) {
    console.error("Error resolving search category:", error);
    return { success: false, error: "Failed to resolve search category" };
  }
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
  options: { page?: number; pageSize?: number; q?: string } = {}
) {
  try {
    const page = Math.max(options.page || 1, 1);
    const pageSize = options.pageSize || 12;
    const q = options.q?.trim();

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

    // With a search term, every listing in the category still shows — it's just
    // ranked by how closely its name matches the query (best match first).
    let softwares;
    let total;
    if (q) {
      const all = await prisma.software.findMany({ where, orderBy: { createdAt: "desc" } });
      const ranked = all
        .map((s) => ({ s, score: nameMatchScore(s.name, q) }))
        .sort((a, b) => a.score - b.score || (b.s.rating || 0) - (a.s.rating || 0))
        .map((r) => r.s);
      total = ranked.length;
      softwares = ranked.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    } else {
      [softwares, total] = await Promise.all([
        prisma.software.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.software.count({ where }),
      ]);
    }

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
    const auth = await requireDashboardUser();
    if (auth.error) return { success: false, error: "Not authenticated." };
    const { session } = auth;

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "";
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;

    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;

    // Arrays
    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    // JSON fields
    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");
    const sentiments = JSON.parse(formData.get("sentiments") as string || "[]");

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

    const software = await prisma.software.create({
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
        vendorId: isAdmin(session) ? null : session.userId,
      },
    });

    revalidateTag("softwares");
    revalidatePath("/");
    return { success: true, data: software };
  } catch (error) {
    console.error("Error creating software:", error);
    return { success: false, error: "Failed to create software" };
  }
}

export async function getSoftwareById(id: string) {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    const access = await getOwnedSoftware(id, session);
    if (access.error) {
      return { success: false, error: access.error };
    }

    return { success: true, data: access.software };
  } catch (error) {
    console.error("Error fetching software by ID:", error);
    return { success: false, error: "Failed to fetch software" };
  }
}

export async function updateSoftware(id: string, formData: FormData) {
  try {
    const auth = await requireDashboardUser();
    if (auth.error) return { success: false, error: "Not authenticated." };
    const { session } = auth;

    const access = await getOwnedSoftware(id, session);
    if (access.error) return { success: false, error: access.error };

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "";
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;

    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;

    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");
    const sentiments = JSON.parse(formData.get("sentiments") as string || "[]");

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

    const software = await prisma.software.update({
      where: { id },
      data: updateData,
    });

    revalidateTag("softwares");
    revalidatePath("/");
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
    const auth = await requireDashboardUser();
    if (auth.error) return { success: false, error: "Not authenticated." };
    const { session } = auth;

    const access = await getOwnedSoftware(id, session);
    if (access.error) return { success: false, error: access.error };
    const software = access.software!;

    const assetUrls = [software.logo, ...(software.pictures || [])].filter(Boolean) as string[];
    for (const url of assetUrls) {
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId(url));
      } catch (err) {
        console.error("Failed to remove Cloudinary asset:", url, err);
      }
    }

    await prisma.software.delete({ where: { id } });
    revalidateTag("softwares");
    revalidatePath("/");
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
    revalidateTag("softwares");
    revalidatePath("/");
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
            sentiments: parseJsonAny(row.sentiments) as any,
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
