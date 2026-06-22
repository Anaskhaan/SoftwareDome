"use server";

import { sendProductSubmissionEmail } from "@/lib/mail";

export async function submitProductForm(formData: FormData) {
  try {
    const productName = (formData.get("productName") as string || "").trim();
    const website = (formData.get("website") as string || "").trim();
    const category = (formData.get("category") as string || "").trim();
    const contactName = (formData.get("contactName") as string || "").trim();
    const contactEmail = (formData.get("contactEmail") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();

    if (!productName || !website || !category || !contactName || !contactEmail || !description) {
      return { success: false, error: "Please fill in all fields." };
    }

    await sendProductSubmissionEmail({ productName, website, category, contactName, contactEmail, description });
    return { success: true };
  } catch (error) {
    console.error("Error sending product submission email:", error);
    return { success: false, error: "Failed to submit your product. Please try again." };
  }
}
