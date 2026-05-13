import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map Prisma models to the format expected by the frontend
    const formattedUsers = users.map(user => ({
      _id: user.id,
      name: user.name || "N/A",
      email: user.email,
      role: user.role,
      status: user.isEmailVerified ? "Active" : "Pending",
      organization: user.organization?.name || "N/A",
      // API Key is not in schema yet, using a placeholder or null
      apiKey: null, 
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
