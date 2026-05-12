import { NextResponse } from "next/server";
import { isBusinessEmail } from "@/lib/auth-utils";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // 1. Business Email Validation
    if (!isBusinessEmail(email)) {
      return NextResponse.json(
        { error: "SoftwareDome requires a business email (e.g., name@company.com)." },
        { status: 403 }
      );
    }

    // 2. Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Store OTP in database
    await prisma.verificationToken.upsert({
      where: {
        email_token: {
          email,
          token: otp,
        },
      },
      update: {
        token: otp,
        expires,
      },
      create: {
        email,
        token: otp,
        expires,
      },
    });

    // 4. Send Email using Nodemailer
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      { message: "OTP sent successfully to your business email." },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
