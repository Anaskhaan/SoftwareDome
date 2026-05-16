import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    // 1. Verify OTP
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: otp,
        expires: { gte: new Date() },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // 3. Create JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // 5. Delete the verification token
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    return NextResponse.json(
      {
        message: "Login successful!",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
