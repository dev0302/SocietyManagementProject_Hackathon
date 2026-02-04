import { Router } from "express";
import { createAnnouncement } from "../controllers/announcementController.js";
import { auth } from "../middlewares/auth.js";
import { isCore } from "../middlewares/roles.js";

const router = Router();

// Core student posts an announcement for their society/department
router.post("/", auth, isCore, createAnnouncement);

export default router;

