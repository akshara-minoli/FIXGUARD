import "dotenv/config";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { seedConfiguredAdmin } from "./admin-seed.js";

const prisma = new PrismaClient();

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

  const result = await seedConfiguredAdmin({ prisma, username, email, password, hashPassword: bcrypt.hash });
  console.log(`Development admin ${result} successfully`);
}

try {
  await seedAdmin();
} catch (error) {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
