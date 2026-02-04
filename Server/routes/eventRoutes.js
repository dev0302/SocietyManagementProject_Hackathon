import { Router } from "express";
import {
  createEvent,
  getSocietyEvents,
  getEventById,
  getEventParticipants,
  issueCertificate,
  createEventInvite,
  acceptEventInvite,
  getEventInviteByToken,
} from "../controllers/eventController.js";
import { auth } from "../middlewares/auth.js";
import { isFacultyOrCoreOrHead } from "../middlewares/roles.js";

const router = Router();

// Faculty, Core, or Head creates an event
router.post("/", auth, isFacultyOrCoreOrHead, createEvent);

// Get events for a society (authenticated users)
router.get("/society/:societyId", auth, getSocietyEvents);

// Public: get event invite by token (must be before /:eventId)
router.get("/invites/by-token", getEventInviteByToken);

// Get single event with participants and certificates
router.get("/:eventId", auth, getEventById);

// Get participants for an event
router.get("/:eventId/participants", auth, getEventParticipants);

// Issue certificate (serialNo) for a participant - faculty/core/head
router.post("/certificates", auth, isFacultyOrCoreOrHead, issueCertificate);

// Create event invite (link/QR) - faculty for their society events
router.post("/invites", auth, isFacultyOrCoreOrHead, createEventInvite);

// Accept event invite - student
router.post("/invites/accept", auth, acceptEventInvite);

export default router;

