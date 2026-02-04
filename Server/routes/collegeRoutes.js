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
  getFacultySocieties,
  getFacultyEvents,
  approveSocietyRequest,
  rejectSocietyRequest,
  deleteSociety,
} from "../controllers/collegeController.js";

const router = Router();

// Admin college management
router.get("/me", auth, isAdmin, getMyCollege);
router.post("/me", auth, isAdmin, upsertMyCollege);

// Public endpoints for society onboarding via unique code
router.get("/code/:code", getCollegeByCode);
router.post("/society-request", createSocietyRequest);

// Admin endpoints for society requests + college societies + events
router.get("/requests", auth, isAdmin, getMySocietyRequests);
router.get("/societies", auth, isAdmin, getMyCollegeSocieties);
router.get("/events", auth, isAdmin, getCollegeEvents);
router.post("/requests/:requestId/approve", auth, isAdmin, approveSocietyRequest);
router.post("/requests/:requestId/reject", auth, isAdmin, rejectSocietyRequest);
router.delete("/societies/:societyId", auth, isAdmin, deleteSociety);

// Faculty: societies and events they coordinate
router.get("/faculty/societies", auth, isFaculty, getFacultySocieties);
router.get("/faculty/events", auth, isFaculty, getFacultyEvents);

export default router;

