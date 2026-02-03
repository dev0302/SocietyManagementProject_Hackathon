import { Router } from "express";
import { getPlatformConfig, updatePlatformConfig } from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/config", auth, isAdmin, getPlatformConfig);
router.put("/config", auth, isAdmin, updatePlatformConfig);

export default router;

