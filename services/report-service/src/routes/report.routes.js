import { Router } from "express";
import { create, detail, mine, mineSummary } from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/authorize-role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
router.use(authenticate, authorizeRole("CITIZEN"));
router.post("/", asyncHandler(create));
router.get("/my", asyncHandler(mine));
router.get("/my/summary", asyncHandler(mineSummary));
router.get("/:id", asyncHandler(detail));
export default router;
