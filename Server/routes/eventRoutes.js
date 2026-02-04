import { Router } from "express";
import { createEvent } from "../controllers/eventController.js";
import { auth } from "../middlewares/auth.js";
import { isCore } from "../middlewares/roles.js";

const router = Router();

// Core student creates an event
router.post("/", auth, isCore, createEvent);

export default router;

