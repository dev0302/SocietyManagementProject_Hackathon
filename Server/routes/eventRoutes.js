import { Router } from "express";
import { createEvent, getSocietyEvents } from "../controllers/eventController.js";
import { auth } from "../middlewares/auth.js";
import { isFacultyOrCoreOrHead } from "../middlewares/roles.js";

const router = Router();

// Faculty, Core, or Head creates an event
router.post("/", auth, isFacultyOrCoreOrHead, createEvent);

// Get events for a society (authenticated users)
router.get("/society/:societyId", auth, getSocietyEvents);

export default router;

