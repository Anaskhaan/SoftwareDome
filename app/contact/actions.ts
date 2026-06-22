"use server";

import { sendContactEmail } from "@/lib/mail";

export async function submitContactForm(formData: FormData) {
  try {
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const subject = (formData.get("subject") as string || "").trim();
    const message = (formData.get("message") as string || "").trim();

    if (!name || !email || !subject || !message) {
      return { success: false, error: "Please fill in all fields." };
    }

    await sendContactEmail({ name, email, subject, message });
    return { success: true };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return { success: false, error: "Failed to send your message. Please try again." };
  }
}
