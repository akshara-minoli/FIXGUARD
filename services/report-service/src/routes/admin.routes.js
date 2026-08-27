import { Router } from "express";
import { detail, list, priority, review, status, summary } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/authorize-role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
router.use(authenticate, authorizeRole("ADMIN"));
router.get("/summary", asyncHandler(summary));
router.get("/", asyncHandler(list));
router.get("/:id", asyncHandler(detail));
router.patch("/:id/review", asyncHandler(review));
router.patch("/:id/status", asyncHandler(status));
router.patch("/:id/priority", asyncHandler(priority));
export default router;
