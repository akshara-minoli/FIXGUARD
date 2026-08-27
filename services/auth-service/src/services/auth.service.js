import bcrypt from "bcrypt";

import prisma from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { signAccessToken } from "../utils/jwt.js";

const BCRYPT_ROUNDS = 12;

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

export async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return prisma.user.create({
    data: { name, email, passwordHash },
    select: safeUserSelect,
  });
}

export async function loginUser({ email, identifier, password }) {
  const loginIdentifier = identifier ?? email;
  const where = loginIdentifier.includes("@")
    ? { email: loginIdentifier }
    : { username: loginIdentifier };
  const user = await prisma.user.findUnique({ where });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { token: signAccessToken(user), user: safeUser };
}

export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateUserProfile(userId, profile) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: profile,
      select: safeUserSelect,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("User not found", 404);
    }

    throw error;
  }
}
