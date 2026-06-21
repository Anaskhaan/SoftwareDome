import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import {
  blogSelect,
  CreateBlogInput,
  resolvePublishedAt,
  validateBlogStatus,
} from "@/lib/blog-types";
import { BlogStatus } from "@/app/generated/prisma/client";

async function isAdminRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const statusParam = searchParams.get("status");
    const admin = await isAdminRequest();

    const where: {
      status?: BlogStatus;
      OR?: Array<{ title?: { contains: string; mode: "insensitive" }; excerpt?: { contains: string; mode: "insensitive" } }>;
      tags?: { has: string };
    } = {};

    if (admin && statusParam) {
      const status = validateBlogStatus(statusParam);
      if (!status) {
        return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
      }
      where.status = status;
    } else if (!admin) {
      where.status = "PUBLISHED";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: blogSelect,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json(
      {
        blogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List blogs error:", error);
    return NextResponse.json({ error: "Failed to fetch blogs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = (await req.json()) as CreateBlogInput;
    const title = body.title?.trim();
    const content = body.content?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    const status = validateBlogStatus(body.status) ?? "DRAFT";
    const slug = body.slug?.trim()
      ? await generateUniqueBlogSlug(body.slug.trim())
      : await generateUniqueBlogSlug(title);

    let publishedAt: Date | null;
    try {
      publishedAt = resolvePublishedAt(status, body.publishedAt);
    } catch {
      return NextResponse.json({ error: "Invalid publishedAt date." }, { status: 400 });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: body.excerpt?.trim() || null,
        coverImage: body.coverImage?.trim() || null,
        images: parseStringArray(body.images),
        tags: parseStringArray(body.tags),
        status,
        metaTitle: body.metaTitle?.trim() || null,
        metaDescription: body.metaDescription?.trim() || null,
        publishedAt,
        authorId: auth.session.userId,
      },
      select: blogSelect,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ error: "Failed to create blog." }, { status: 500 });
  }
}
