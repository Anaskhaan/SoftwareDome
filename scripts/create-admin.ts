import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const domain = email.split("@")[1];

  const organization = await prisma.organization.upsert({
    where: { domain },
    create: { domain, name: domain.split(".")[0].toUpperCase() },
    update: {},
  });

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true,
      organizationId: organization.id,
    },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  console.log(`Admin ready: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
