import cloudinary from "@/lib/cloudinary";

export async function uploadToCloudinary(
  file: File,
  folder = "uploads"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      })
      .end(buffer);
  });
}

export async function uploadManyToCloudinary(
  files: File[],
  folder = "uploads"
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      const url = await uploadToCloudinary(file, folder);
      if (url) urls.push(url);
    }
  }

  return urls;
}
