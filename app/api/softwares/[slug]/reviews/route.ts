import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

async function getSoftwareBySlug(slug: string) {
  return prisma.software.findUnique({ where: { slug } });
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const software = await getSoftwareBySlug(slug);

    if (!software) {
      return NextResponse.json({ error: "Software not found." }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { softwareId: software.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to leave a review." },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { slug } = await context.params;
    const software = await getSoftwareBySlug(slug);

    if (!software) {
      return NextResponse.json({ error: "Software not found." }, { status: 404 });
    }

    const { content } = await req.json();
    const trimmed = typeof content === "string" ? content.trim() : "";

    if (!trimmed) {
      return NextResponse.json({ error: "Review content is required." }, { status: 400 });
    }

    if (trimmed.length > 2000) {
      return NextResponse.json(
        { error: "Review must be 2000 characters or less." },
        { status: 400 }
      );
    }

    const review = await prisma.review.upsert({
      where: {
        userId_softwareId: {
          userId: payload.userId as string,
          softwareId: software.id,
        },
      },
      update: { content: trimmed },
      create: {
        content: trimmed,
        userId: payload.userId as string,
        softwareId: software.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Post review error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
