import { AppError } from "../utils/app-error.js";
export const authorizeRoles = (...roles) => (request, _response, next) => roles.includes(request.auth?.role) ? next() : next(new AppError(request.auth ? "You do not have permission to access this resource" : "Authentication is required", request.auth ? 403 : 401));
