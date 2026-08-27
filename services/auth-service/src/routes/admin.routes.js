import { Router } from "express";

import {
  getUserById,
  getUsers,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/authorize-role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate, authorizeRole("ADMIN"));
router.get("/users", asyncHandler(getUsers));
router.get("/users/:id", asyncHandler(getUserById));

export default router;
