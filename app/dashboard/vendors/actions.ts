"use server";

import prisma from "@/lib/prisma";
import { getDashboardSession, isAdmin } from "@/lib/require-dashboard";

export async function getDashboardVendors() {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    const where = isAdmin(session) ? { role: "VENDOR" as const } : { id: session.userId, role: "VENDOR" as const };

    const vendors = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        companyName: true,
        companyEmail: true,
        companyPhone: true,
        companyAddress: true,
        createdAt: true,
        _count: {
          select: { software: true },
        },
      },
    });

    return {
      success: true,
      data: vendors.map((vendor) => ({
        id: vendor.id,
        name: vendor.companyName || vendor.name || vendor.email,
        contactName: vendor.name,
        email: vendor.companyEmail || vendor.email,
        phone: vendor.companyPhone,
        address: vendor.companyAddress,
        products: vendor._count.software,
        status: vendor.status || "Active",
        createdAt: vendor.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { success: false, error: "Failed to fetch vendors" };
  }
}

export async function deleteVendors(ids: string[]) {
  try {
    const session = await getDashboardSession();
    if (!session || !isAdmin(session)) {
      return { success: false, error: "Admin access required." };
    }

    const targetIds = ids.filter((id) => id !== session.userId);
    if (!targetIds.length) {
      return { success: false, error: "No vendors selected." };
    }

    const result = await prisma.user.deleteMany({
      where: { id: { in: targetIds }, role: "VENDOR" },
    });
    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error deleting vendors:", error);
    return { success: false, error: "Failed to delete vendors" };
  }
}
