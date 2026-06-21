"use server";

import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";

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

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const name = formData.get("name") as string;
    const website = formData.get("website") as string;
    const category = formData.get("category") as string || "";
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

    const slug = slugify(name);

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

    const software = await (prisma.software as any).create({
      data: {
        name,
        slug,
        logo: logoUrl,
        website,
        category,
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

export async function getSoftwareById(id: string) {
  try {
    const software = await prisma.software.findUnique({
      where: { id },
    });
    return { success: true, data: software };
  } catch (error) {
    console.error("Error fetching software by ID:", error);
    return { success: false, error: "Failed to fetch software" };
  }
}

export async function updateSoftware(id: string, formData: FormData) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const name = formData.get("name") as string;
    const website = formData.get("website") as string;
    const category = formData.get("category") as string || "";
    const introduction = formData.get("introduction") as string;
    const ourVerdict = formData.get("ourVerdict") as string;
    const rating = parseFloat(formData.get("rating") as string) || 0;
    const reportUrl = formData.get("reportUrl") as string;
    
    const howItWorks = formData.get("howItWorks") as string;
    const whoIsItFor = formData.get("whoIsItFor") as string;
    const howItIsDifferent = formData.get("howItIsDifferent") as string;
    const sentiments = formData.get("sentiments") as string;

    const keyTakeaways = JSON.parse(formData.get("keyTakeaways") as string || "[]");
    const pros = JSON.parse(formData.get("pros") as string || "[]");
    const cons = JSON.parse(formData.get("cons") as string || "[]");

    const specifications = JSON.parse(formData.get("specifications") as string || "{}");
    const faqs = JSON.parse(formData.get("faqs") as string || "[]");

    if (!name) {
      return { success: false, error: "Software name is required" };
    }

    const slug = slugify(name);
    const slugOwner = await prisma.software.findUnique({ where: { slug } });
    if (slugOwner && slugOwner.id !== id) {
      return { success: false, error: "A software with this name/slug already exists" };
    }

    const updateData: any = {
      name,
      slug,
      website,
      category,
      rating,
      reportUrl,
      introduction,
      ourVerdict,
      keyTakeaways,
      pros,
      cons,
      howItWorks,
      whoIsItFor,
      howItIsDifferent,
      sentiments,
      specifications,
      faqs,
    };

    // Handle Image Uploads conditionally
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0) {
      updateData.logo = await uploadToCloudinary(logoFile);
    }

    const pictureUrls: string[] = JSON.parse(formData.get("existingPictures") as string || "[]");
    const newPictures = formData.getAll("pictures") as File[];
    for (const pic of newPictures) {
      if (pic && pic instanceof File && pic.size > 0) {
        const url = await uploadToCloudinary(pic);
        pictureUrls.push(url);
      }
    }
    updateData.pictures = pictureUrls;

    const software = await (prisma.software as any).update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: software };
  } catch (error) {
    console.error("Error updating software:", error);
    return { success: false, error: "Failed to update software" };
  }
}

function cloudinaryPublicId(url: string): string {
  return url.split("/").slice(-2).join("/").replace(/\.[a-zA-Z]+$/, "");
}

export async function deleteSoftware(id: string) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return { success: false, error: "Admin access required." };

    const software = await prisma.software.findUnique({ where: { id } });
    if (!software) {
      return { success: false, error: "Software not found." };
    }

    const assetUrls = [software.logo, ...(software.pictures || [])].filter(Boolean) as string[];
    for (const url of assetUrls) {
      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId(url));
      } catch (err) {
        console.error("Failed to remove Cloudinary asset:", url, err);
      }
    }

    await prisma.software.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting software:", error);
    return { success: false, error: "Failed to delete software" };
  }
}

export async function getSoftwareBySlug(slug: string) {
  try {
    const software = await prisma.software.findUnique({
      where: { slug },
    });
    return { success: true, data: software };
  } catch (error) {
    console.error("Error fetching software by slug:", error);
    return { success: false, error: "Failed to fetch software" };
  }
}
