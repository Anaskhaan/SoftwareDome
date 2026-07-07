import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
import {
  blogSelect,
  CreateBlogInput,
  validateBlogStatus,
} from "@/lib/blog-types";

type RouteContext = { params: Promise<{ id: string }> };

async function isAdminRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "ADMIN";
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const admin = await isAdminRequest();

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: blogSelect,
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    if (!admin && blog.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json({ error: "Failed to fetch blog." }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const body = (await req.json()) as CreateBlogInput;
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      updateData.title = title;
    }

    if (body.content !== undefined) {
      const content = body.content.trim();
      if (!content) {
        return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
      }
      updateData.content = sanitizeBlogHtml(content);
    }

    if (body.excerpt !== undefined) {
      updateData.excerpt = body.excerpt?.trim() || null;
    }

    if (body.coverImage !== undefined) {
      updateData.coverImage = body.coverImage?.trim() || null;
    }

    if (body.images !== undefined) {
      updateData.images = parseStringArray(body.images);
    }

    if (body.tags !== undefined) {
      updateData.tags = parseStringArray(body.tags);
    }

    if (body.metaTitle !== undefined) {
      updateData.metaTitle = body.metaTitle?.trim() || null;
    }

    if (body.metaDescription !== undefined) {
      updateData.metaDescription = body.metaDescription?.trim() || null;
    }

    if (body.slug !== undefined) {
      const slugInput = body.slug.trim();
      if (!slugInput) {
        return NextResponse.json({ error: "Slug cannot be empty." }, { status: 400 });
      }
      updateData.slug = await generateUniqueBlogSlug(slugInput, id);
    } else if (body.title !== undefined) {
      updateData.slug = await generateUniqueBlogSlug(body.title.trim(), id);
    }

    const nextStatus = body.status !== undefined ? validateBlogStatus(body.status) : null;
    if (body.status !== undefined && !nextStatus) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    if (nextStatus) {
      updateData.status = nextStatus;
    }

    if (body.publishedAt !== undefined) {
      if (body.publishedAt === null || body.publishedAt === "") {
        updateData.publishedAt = null;
      } else {
        const parsed = new Date(body.publishedAt);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json({ error: "Invalid publishedAt date." }, { status: 400 });
        }
        updateData.publishedAt = parsed;
      }
    } else if (nextStatus === "PUBLISHED" && existing.status !== "PUBLISHED" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
      select: blogSelect,
    });

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Failed to update blog." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await context.params;

    const existing = await prisma.blog.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({ message: "Blog deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Failed to delete blog." }, { status: 500 });
  }
}
