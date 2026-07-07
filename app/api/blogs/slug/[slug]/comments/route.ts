import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({ where: { slug } });
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { blogId: blog.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in to comment." }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { slug } = await context.params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const { content } = await req.json();
    const trimmed = typeof content === "string" ? content.trim() : "";

    if (!trimmed) {
      return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    }

    if (trimmed.length > 2000) {
      return NextResponse.json({ error: "Comment must be 2000 characters or less." }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { content: trimmed, userId: payload.userId as string, blogId: blog.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
  }
}
