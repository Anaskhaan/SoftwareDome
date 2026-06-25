"use server";

import prisma from "@/lib/prisma";
import { sendDemoRequestEmail } from "@/lib/mail";
import { getDashboardSession, isAdmin } from "@/lib/require-dashboard";

export async function submitDemoRequest(formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const organization = (formData.get("organization") as string || "").trim();
    const softwareId = (formData.get("softwareId") as string || "").trim();

    if (!name || !email || !phone || !organization || !softwareId) {
      return { success: false, error: "Please fill in all fields." };
    }

    const software = await prisma.software.findUnique({
      where: { id: softwareId },
      include: { vendor: { select: { email: true, companyEmail: true } } },
    });
    if (!software) {
      return { success: false, error: "Software not found." };
    }

    await prisma.demoRequest.create({
      data: { name, email, phone, organization, softwareId },
    });

    const notifyEmail =
      software.vendor?.companyEmail || software.vendor?.email || process.env.GMAIL_USER || "";
    if (notifyEmail) {
      await sendDemoRequestEmail({
        name,
        email,
        phone,
        organization,
        softwareName: software.name,
        notifyEmail,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting demo request:", error);
    return { success: false, error: "Failed to submit your request. Please try again." };
  }
}

export async function getDashboardDemoRequests() {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    const requests = await prisma.demoRequest.findMany({
      where: isAdmin(session) ? undefined : { software: { vendorId: session.userId } },
      orderBy: { createdAt: "desc" },
      include: { software: { select: { name: true, slug: true } } },
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error("Error fetching demo requests:", error);
    return { success: false, error: "Failed to fetch demo requests" };
  }
}

export async function deleteDemoRequests(ids: string[]) {
  try {
    const session = await getDashboardSession();
    if (!session) {
      return { success: false, error: "Not authenticated." };
    }

    if (!ids.length) {
      return { success: false, error: "No demo requests selected." };
    }

    const result = await prisma.demoRequest.deleteMany({
      where: {
        id: { in: ids },
        ...(isAdmin(session) ? {} : { software: { vendorId: session.userId } }),
      },
    });
    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error deleting demo requests:", error);
    return { success: false, error: "Failed to delete demo requests" };
  }
}
