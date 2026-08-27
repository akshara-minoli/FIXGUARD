import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const safeUserSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  phoneNumber: true,
  profileImageUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export function listUsers() {
  return prisma.user.findMany({
    select: safeUserSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
