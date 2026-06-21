import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { blogSelect } from "@/lib/blog-types";

type RouteContext = { params: Promise<{ slug: string }> };

async function isAdminRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  const payload = await verifyJWT(token);
  return payload?.role === "ADMIN";
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const admin = await isAdminRequest();

    const blog = await prisma.blog.findUnique({
      where: { slug },
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
    console.error("Get blog by slug error:", error);
    return NextResponse.json({ error: "Failed to fetch blog." }, { status: 500 });
  }
}
