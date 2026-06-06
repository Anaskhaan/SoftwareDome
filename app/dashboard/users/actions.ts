"use server";

import prisma from "@/lib/prisma";
import { isBusinessEmail } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users in action:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function createUser(formData: {
  name: string;
  email: string;
  role: string;
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyPhone?: string;
}) {
  try {
    const { name, email, role, companyName, companyEmail, companyAddress, companyPhone } = formData;

    if (!name || !email || !role) {
      return { success: false, error: "All fields are required" };
    }

    if (!isBusinessEmail(email)) {
      return {
        success: false,
        error: "Personal email addresses are not allowed. Please use a business email.",
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Generate a temporary password (they will change it later)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role as any,
        password: hashedPassword,
        status: "Active",
        companyName: role === "VENDOR" ? companyName : null,
        companyEmail: role === "VENDOR" ? companyEmail : null,
        companyAddress: role === "VENDOR" ? companyAddress : null,
        companyPhone: role === "VENDOR" ? companyPhone : null,
      },
    });

    console.log(`User created: ${newUser.email}. Temp password: ${tempPassword}`);
    
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}
