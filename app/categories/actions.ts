"use server";

import prisma from "@/lib/prisma";

function nameMatchScore(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return 3;
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: { _count: { select: { softwares: true } } },
        },
      },
    });

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      count: c.subcategories.reduce((sum, s) => sum + s._count.softwares, 0),
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isGeneral: s.isGeneral,
        count: s._count.softwares,
      })),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getCategoryWithSubcategories(categorySlug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: { _count: { select: { softwares: true } } },
        },
      },
    });
    if (!category) return { success: true, data: null };

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        subcategories: category.subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          isGeneral: s.isGeneral,
          count: s._count.softwares,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
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

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return { success: true, data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: null } };
    }

    const where = { subcategory: { categoryId: category.id } };

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
        categoryName: category.name,
      },
    };
  } catch (error) {
    console.error("Error fetching softwares by category:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

export async function getSoftwaresBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
  options: { page?: number; pageSize?: number; q?: string } = {}
) {
  try {
    const page = Math.max(options.page || 1, 1);
    const pageSize = options.pageSize || 12;
    const q = options.q?.trim();

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return {
        success: true,
        data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: null, subcategoryName: null },
      };
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: subcategorySlug } },
    });
    if (!subcategory) {
      return {
        success: true,
        data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: category.name, subcategoryName: null },
      };
    }

    const where = { subcategoryId: subcategory.id };

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
        categoryName: category.name,
        subcategoryName: subcategory.name,
      },
    };
  } catch (error) {
    console.error("Error fetching softwares by subcategory:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}
