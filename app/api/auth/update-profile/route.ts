import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { isBusinessEmail } from "@/lib/auth-utils";

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
    const { name, image, email, companyName, companyEmail, companyAddress, companyPhone } = body;

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      image?: string;
      email?: string;
      companyName?: string;
      companyEmail?: string;
      companyAddress?: string;
      companyPhone?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (currentUser.role === "VENDOR") {
      if (companyName !== undefined) updateData.companyName = companyName;
      if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
      if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
      if (companyPhone !== undefined) updateData.companyPhone = companyPhone;
    }

    if (email !== undefined && email !== currentUser.email) {
      if (currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admins can change their email address." },
          { status: 403 }
        );
      }

      if (!isBusinessEmail(email)) {
        return NextResponse.json(
          { error: "Personal email addresses are not allowed. Please use a business email." },
          { status: 403 }
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        organization: { select: { name: true } },
        companyName: true,
        companyEmail: true,
        companyAddress: true,
        companyPhone: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("updateProfile Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
