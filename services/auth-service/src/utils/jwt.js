import jwt from "jsonwebtoken";

import { AppError } from "./app-error.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === "replace_with_secure_secret") {
    throw new AppError("JWT configuration is unavailable", 500);
  }

  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "1h" },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}
