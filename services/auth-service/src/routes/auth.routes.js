import { Router } from "express";

import { login, me, register, updateMe } from "../controllers/auth.controller.js";
import { testAccess } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRole } from "../middleware/authorize-role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));
router.patch("/me", authenticate, asyncHandler(updateMe));
router.get("/admin/test", authenticate, authorizeRole("ADMIN"), testAccess);

export default router;
