import { Router } from "express";
import { createAnnouncement, getMyAnnouncements } from "../controllers/announcementController.js";
import { auth } from "../middlewares/auth.js";
import { isCore } from "../middlewares/roles.js";

const router = Router();

// Core student posts an announcement
router.post("/", auth, isCore, createAnnouncement);

// Core student fetches their own announcements
router.get("/me", auth, isCore, getMyAnnouncements);

export default router;

