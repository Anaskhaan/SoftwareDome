import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export type DashboardRole = "ADMIN" | "VENDOR";

export type DashboardSession = {
  userId: string;
  email: string;
  role: DashboardRole;
};

type DashboardAuthResult =
  | { session: DashboardSession; error?: never }
  | { session?: never; error: NextResponse };

async function readSession(): Promise<DashboardSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload?.userId || !payload.role) return null;

  if (payload.role !== "ADMIN" && payload.role !== "VENDOR") return null;

  return {
    userId: payload.userId as string,
    email: payload.email as string,
    role: payload.role as DashboardRole,
  };
}

export async function getDashboardSession(): Promise<DashboardSession | null> {
  return readSession();
}

export async function requireDashboardUser(): Promise<DashboardAuthResult> {
  const session = await readSession();

  if (!session) {
    return {
      error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  return { session };
}

export function isAdmin(session: DashboardSession): boolean {
  return session.role === "ADMIN";
}
