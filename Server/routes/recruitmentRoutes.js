import { Router } from "express";
import {
  createApplication,
  createInterviewPanel,
  submitInterviewFeedback,
  chooseFinalSociety,
} from "../controllers/recruitmentController.js";
import { createEvent, issueCertificate } from "../controllers/eventController.js";
import { auth } from "../middlewares/auth.js";
import { isCore, isHead, isMember } from "../middlewares/roles.js";

const router = Router();

// Student applications
router.post("/applications", auth, createApplication);

// Panel and feedback – managed by internal society roles
router.post("/panels", auth, isCore, createInterviewPanel);
router.post("/feedback", auth, submitInterviewFeedback);

// Student chooses final society when selected by multiple
router.post("/choose-final-society", auth, chooseFinalSociety);

// Events & certificates – internal
router.post("/events", auth, isCore, createEvent);
router.post("/certificates", auth, isCore, issueCertificate);

export default router;

