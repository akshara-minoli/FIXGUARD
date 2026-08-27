import "dotenv/config";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();

  if (!value || value.startsWith("replace_with_")) {
    throw new Error(`${name} must be configured before seeding the admin`);
  }

  return value;
}

async function seedAdmin() {
  const username = requiredEnvironmentValue("ADMIN_USERNAME").toLowerCase();
  const email = requiredEnvironmentValue("ADMIN_EMAIL").toLowerCase();
  const password = requiredEnvironmentValue("ADMIN_PASSWORD");

  if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
    throw new Error("ADMIN_USERNAME must be 3-50 characters using letters, numbers, dots, underscores, or hyphens");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes");
  }

  const [userWithUsername, userWithEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (userWithUsername || userWithEmail) {
    const existingAdmin = userWithUsername ?? userWithEmail;
    const identityMatches =
      existingAdmin.username === username &&
      existingAdmin.email === email &&
      existingAdmin.role === "ADMIN";

    if (!identityMatches || (userWithUsername && userWithEmail && userWithUsername.id !== userWithEmail.id)) {
      throw new Error("Configured admin identity conflicts with an existing user; review it manually");
    }

    console.log("Development admin already exists; no changes made");
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.create({
    data: {
      username,
      name: "FixGuard Administrator",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Development admin created successfully");
}

try {
  await seedAdmin();
} catch (error) {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
