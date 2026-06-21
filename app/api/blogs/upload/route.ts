import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { uploadManyToCloudinary, uploadToCloudinary } from "@/lib/cloudinary-upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return `Unsupported file type: ${file.name}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (max 5MB): ${file.name}`;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("images"),
    ].filter((item): item is File => item instanceof File && item.size > 0);

    const coverFile = formData.get("coverImage");
    const singleFile = formData.get("file");

    if (files.length === 0) {
      if (coverFile instanceof File && coverFile.size > 0) {
        files.push(coverFile);
      } else if (singleFile instanceof File && singleFile.size > 0) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No image files provided." }, { status: 400 });
    }

    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const folder = (formData.get("folder") as string)?.trim() || "blogs";

    if (files.length === 1) {
      const url = await uploadToCloudinary(files[0], folder);
      return NextResponse.json({ url, urls: [url] }, { status: 200 });
    }

    const urls = await uploadManyToCloudinary(files, folder);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error("Blog upload error:", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
