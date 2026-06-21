const blogAuthorSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export const blogSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  images: true,
  tags: true,
  status: true,
  metaTitle: true,
  metaDescription: true,
  publishedAt: true,
  authorId: true,
  author: { select: blogAuthorSelect },
  createdAt: true,
  updatedAt: true,
} as const;

export type CreateBlogInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  images?: unknown;
  tags?: unknown;
  status?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
};

export function validateBlogStatus(status: unknown): "DRAFT" | "PUBLISHED" | "ARCHIVED" | null {
  if (status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED") {
    return status;
  }
  return null;
}

export function resolvePublishedAt(
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  publishedAtInput?: string | null,
  existingPublishedAt?: Date | null
) {
  if (publishedAtInput) {
    const parsed = new Date(publishedAtInput);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid publishedAt date.");
    }
    return parsed;
  }

  if (status === "PUBLISHED") {
    return existingPublishedAt ?? new Date();
  }

  return null;
}
