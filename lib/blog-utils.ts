import prisma from "@/lib/prisma";

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateUniqueBlogSlug(title: string, excludeId?: string) {
  const base = slugifyTitle(title);

  if (!base) {
    throw new Error("Title must contain at least one alphanumeric character.");
  }

  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug } });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      return value.trim() ? [value.trim()] : [];
    }
  }

  return [];
}
