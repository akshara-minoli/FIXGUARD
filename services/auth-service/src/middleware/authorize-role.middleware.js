import { AppError } from "../utils/app-error.js";

export function authorizeRole(...allowedRoles) {
  const roles = new Set(allowedRoles);

  return (request, _response, next) => {
    if (!request.auth) {
      return next(new AppError("Authentication is required", 401));
    }

    if (!roles.has(request.auth.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    return next();
  };
}
