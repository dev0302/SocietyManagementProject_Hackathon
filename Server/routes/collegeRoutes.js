import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/roles.js";
import {
  getMyCollege,
  upsertMyCollege,
  getCollegeByCode,
  createSocietyRequest,
  getMySocietyRequests,
  getMyCollegeSocieties,
  approveSocietyRequest,
  rejectSocietyRequest,
} from "../controllers/collegeController.js";

const router = Router();

// Admin college management
router.get("/me", auth, isAdmin, getMyCollege);
router.post("/me", auth, isAdmin, upsertMyCollege);

// Public endpoints for society onboarding via unique code
router.get("/code/:code", getCollegeByCode);
router.post("/society-request", auth, createSocietyRequest);

// Admin endpoints for society requests + college societies
router.get("/requests", auth, isAdmin, getMySocietyRequests);
router.get("/societies", auth, isAdmin, getMyCollegeSocieties);
router.post("/requests/:requestId/approve", auth, isAdmin, approveSocietyRequest);
router.post("/requests/:requestId/reject", auth, isAdmin, rejectSocietyRequest);

export default router;

