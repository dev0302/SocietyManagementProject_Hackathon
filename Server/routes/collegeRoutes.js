import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isCollegeAdmin, isFaculty, attachCollegeIfAny } from "../middlewares/roles.js";
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
  uploadCollegeProfileImage,
} from "../controllers/collegeController.js";

const router = Router();

// College admin: get/update my college (attachCollegeIfAny for upsert so OTP create still works for platform admin)
router.get("/me", auth, isCollegeAdmin, getMyCollege);
router.post("/me", auth, attachCollegeIfAny, upsertMyCollege);
router.post("/me/profile-image", auth, attachCollegeIfAny, uploadCollegeProfileImage);

// Public endpoints for society onboarding via unique code
router.get("/code/:code", getCollegeByCode);
router.post("/society-request", createSocietyRequest);

// Public: get society invite by token (for onboarding page with token)
router.get("/society-invite", getSocietyInviteByToken);

// College admin: society requests, societies, events, invite link
router.get("/requests", auth, isCollegeAdmin, getMySocietyRequests);
router.get("/societies", auth, isCollegeAdmin, getMyCollegeSocieties);
router.get("/events", auth, isCollegeAdmin, getCollegeEvents);
router.post("/requests/:requestId/approve", auth, isCollegeAdmin, approveSocietyRequest);
router.post("/requests/:requestId/reject", auth, isCollegeAdmin, rejectSocietyRequest);
router.delete("/societies/:societyId", auth, isCollegeAdmin, deleteSociety);
router.post("/society-invite-link", auth, isCollegeAdmin, createSocietyInviteLink);

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

