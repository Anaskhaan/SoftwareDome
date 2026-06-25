"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { blogSelect, resolvePublishedAt, validateBlogStatus } from "@/lib/blog-types";
import { uploadManyToCloudinary, uploadToCloudinary } from "@/lib/cloudinary-upload";

async function getAdminSession() {
  const auth = await requireAdmin();
  if (auth.error) {
    return { success: false as const, error: "Admin access required." };
  }
  return { success: true as const, session: auth.session };
}

export async function getBlogs(search?: string, status?: string) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    const where: {
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      OR?: Array<{
        title?: { contains: string; mode: "insensitive" };
        excerpt?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    if (status) {
      const validStatus = validateBlogStatus(status);
      if (validStatus) where.status = validStatus;
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const blogs = await prisma.blog.findMany({
      where,
      select: blogSelect,
      orderBy: [{ updatedAt: "desc" }],
    });

    return { success: true, data: blogs };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { success: false, error: "Failed to fetch blogs." };
  }
}

export async function getBlogById(id: string) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: blogSelect,
    });

    if (!blog) {
      return { success: false, error: "Blog not found." };
    }

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { success: false, error: "Failed to fetch blog." };
  }
}

async function parseBlogFormData(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const slugInput = (formData.get("slug") as string)?.trim();
  const status = validateBlogStatus(formData.get("status")) ?? "DRAFT";
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || null;
  const tags = parseStringArray(formData.get("tags"));

  if (!title) {
    return { error: "Title is required." };
  }

  if (!content) {
    return { error: "Content is required." };
  }

  let coverImage = (formData.get("existingCoverImage") as string)?.trim() || null;
  const coverFile = formData.get("coverImage") as File;
  if (coverFile && coverFile.size > 0) {
    coverImage = await uploadToCloudinary(coverFile, "blogs");
  }

  const images = parseStringArray(formData.get("existingImages"));
  const newImageFiles = formData.getAll("images") as File[];
  const uploadedImages = await uploadManyToCloudinary(
    newImageFiles.filter((f) => f instanceof File && f.size > 0),
    "blogs"
  );

  return {
    data: {
      title,
      content,
      excerpt,
      slugInput,
      status,
      metaTitle,
      metaDescription,
      tags,
      coverImage,
      images: [...images, ...uploadedImages],
    },
  };
}

export async function createBlog(formData: FormData) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    const parsed = await parseBlogFormData(formData);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data } = parsed;
    const slug = data.slugInput
      ? await generateUniqueBlogSlug(data.slugInput)
      : await generateUniqueBlogSlug(data.title);

    const publishedAt = resolvePublishedAt(data.status);

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        images: data.images,
        tags: data.tags,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt,
        authorId: auth.session.userId,
      },
      select: blogSelect,
    });

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error creating blog:", error);
    return { success: false, error: "Failed to create blog." };
  }
}

export async function updateBlog(id: string, formData: FormData) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Blog not found." };
    }

    const parsed = await parseBlogFormData(formData);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data } = parsed;
    const slug = data.slugInput
      ? await generateUniqueBlogSlug(data.slugInput, id)
      : await generateUniqueBlogSlug(data.title, id);

    let publishedAt = existing.publishedAt;
    if (data.status === "PUBLISHED" && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        images: data.images,
        tags: data.tags,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt,
      },
      select: blogSelect,
    });

    return { success: true, data: blog };
  } catch (error) {
    console.error("Error updating blog:", error);
    return { success: false, error: "Failed to update blog." };
  }
}

export async function deleteBlog(id: string) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Blog not found." };
    }

    await prisma.blog.delete({ where: { id } });

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: "Failed to delete blog." };
  }
}

export async function deleteBlogs(ids: string[]) {
  try {
    const auth = await getAdminSession();
    if (!auth.success) return auth;

    if (!ids.length) {
      return { success: false, error: "No blogs selected." };
    }

    const result = await prisma.blog.deleteMany({ where: { id: { in: ids } } });
    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error deleting blogs:", error);
    return { success: false, error: "Failed to delete blogs." };
  }
}
