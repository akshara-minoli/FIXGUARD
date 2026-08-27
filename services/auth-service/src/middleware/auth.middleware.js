import jwt from "jsonwebtoken";

import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const { JsonWebTokenError, TokenExpiredError } = jwt;

export function authenticate(request, _response, next) {
  const authorization = request.get("authorization");

  if (!authorization) {
    return next(new AppError("Authentication token is required", 401));
  }

  const [scheme, token, extra] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || extra) {
    return next(new AppError("Authorization header must use Bearer token format", 401));
  }

  try {
    const payload = verifyAccessToken(token);

    if (typeof payload !== "object" || !payload.userId || !payload.role) {
      return next(new AppError("Invalid authentication token", 401));
    }

    request.auth = { userId: payload.userId, role: payload.role };
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("Authentication token has expired", 401));
    }

    if (error instanceof JsonWebTokenError) {
      return next(new AppError("Invalid authentication token", 401));
    }

    return next(error);
  }
}
