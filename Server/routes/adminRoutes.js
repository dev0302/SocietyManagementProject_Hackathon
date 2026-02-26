import { Router } from "express";
import { getPlatformConfig, updatePlatformConfig } from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";
import { isPlatformAdmin } from "../middlewares/roles.js";

const router = Router();

router.get("/config", auth, isPlatformAdmin, getPlatformConfig);
router.put("/config", auth, isPlatformAdmin, updatePlatformConfig);

export default router;

