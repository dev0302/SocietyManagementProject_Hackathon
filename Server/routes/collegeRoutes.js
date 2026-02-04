import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isAdmin, isFaculty } from "../middlewares/roles.js";
import {
  getMyCollege,
  upsertMyCollege,
  getCollegeByCode,
  createSocietyRequest,
  getMySocietyRequests,
  getMyCollegeSocieties,
  getCollegeEvents,
  getFacultyCollege,
  getFacultySocieties,
  getFacultyEvents,
  getFacultyAllSocieties,
  getFacultyAllEvents,
  approveSocietyRequest,
  rejectSocietyRequest,
  deleteSociety,
  createSocietyInviteLink,
  getSocietyInviteByToken,
  createSocietyFromInvite,
} from "../controllers/collegeController.js";

const router = Router();

// Admin college management
router.get("/me", auth, isAdmin, getMyCollege);
router.post("/me", auth, isAdmin, upsertMyCollege);

// Public endpoints for society onboarding via unique code
router.get("/code/:code", getCollegeByCode);
router.post("/society-request", createSocietyRequest);

// Public: get society invite by token (for onboarding page with token)
router.get("/society-invite", getSocietyInviteByToken);

// Admin endpoints for society requests + college societies + events
router.get("/requests", auth, isAdmin, getMySocietyRequests);
router.get("/societies", auth, isAdmin, getMyCollegeSocieties);
router.get("/events", auth, isAdmin, getCollegeEvents);
router.post("/requests/:requestId/approve", auth, isAdmin, approveSocietyRequest);
router.post("/requests/:requestId/reject", auth, isAdmin, rejectSocietyRequest);
router.delete("/societies/:societyId", auth, isAdmin, deleteSociety);

// Admin: create society invite link with faculty head email
router.post("/society-invite-link", auth, isAdmin, createSocietyInviteLink);

// Authenticated: create society from invite (faculty head email must match)
router.post("/society-from-invite", auth, createSocietyFromInvite);

// Faculty: college they belong to + societies and events
router.get("/faculty/college", auth, isFaculty, getFacultyCollege);
router.get("/faculty/societies", auth, isFaculty, getFacultySocieties);
router.get("/faculty/events", auth, isFaculty, getFacultyEvents);
// Faculty: all societies in college (view only) and all events in college
router.get("/faculty/all-societies", auth, isFaculty, getFacultyAllSocieties);
router.get("/faculty/all-events", auth, isFaculty, getFacultyAllEvents);

export default router;

