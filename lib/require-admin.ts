import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

type AdminSession = {
  userId: string;
  email: string;
  role: string;
};

type AdminAuthResult =
  | { session: AdminSession; error?: never }
  | { session?: never; error: NextResponse };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {
      error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  const payload = await verifyJWT(token);

  if (!payload?.userId) {
    return {
      error: NextResponse.json({ error: "Invalid session." }, { status: 401 }),
    };
  }

  if (payload.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }

  return {
    session: {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    },
  };
}
