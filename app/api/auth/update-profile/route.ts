import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    // Update only allowed fields
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        name: name !== undefined ? name : undefined,
        image: image !== undefined ? image : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("updateProfile Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
