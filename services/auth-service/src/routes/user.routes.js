import { Router } from "express";

import { me, updateMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/me", authenticate, asyncHandler(me));
router.patch("/me", authenticate, asyncHandler(updateMe));

export default router;
