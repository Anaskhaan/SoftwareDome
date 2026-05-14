"use server";

import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function getSoftwares() {
  try {
    const softwares = await prisma.software.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: softwares };
  } catch (error) {
    console.error("Error fetching softwares:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "softwares" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    );
    uploadStream.end(buffer);
  });
}

export async function createSoftware(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const website = formData.get("website") as string;
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;

    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;
    const sentiments = formData.get("sentiments") as string;

    // Arrays
    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    // JSON fields
    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");

    if (!name) {
      return { success: false, error: "Software name is required" };
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingSoftware = await prisma.software.findUnique({
      where: { slug },
    });

    if (existingSoftware) {
      return { success: false, error: "A software with this name/slug already exists" };
    }

    // Handle Image Uploads
    let logoUrl = "";
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadToCloudinary(logoFile);
    }

    const pictureUrls: string[] = [];
    const pictures = formData.getAll("pictures") as File[];
    for (const pic of pictures) {
      if (pic && pic instanceof File && pic.size > 0) {
        const url = await uploadToCloudinary(pic);
        pictureUrls.push(url);
      }
    }

    const software = await prisma.software.create({
      data: {
        name,
        slug,
        logo: logoUrl,
        website,
        rating,
        reportUrl,
        introduction,
        ourVerdict,
        keyTakeaways,
        pros,
        cons,
        pictures: pictureUrls,
        howItWorks,
        whoIsItFor,
        howItIsDifferent,
        sentiments,
        specifications,
        faqs,
      },
    });

    return { success: true, data: software };
  } catch (error) {
    console.error("Error creating software:", error);
    return { success: false, error: "Failed to create software" };
  }
}
