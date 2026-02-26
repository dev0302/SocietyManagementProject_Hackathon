import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isPlatformAdmin, isUniversityAdmin } from "../middlewares/roles.js";
import {
  createUniversity,
  listUniversities,
  getUniversity,
  updateUniversity,
  listCollegesByUniversity,
} from "../controllers/universityController.js";
import { createCollegeUnderUniversity } from "../controllers/collegeController.js";

const router = Router();

// Platform admin only
router.post("/", auth, isPlatformAdmin, createUniversity);
router.get("/", auth, listUniversities);

// Single university (any authenticated user can read)
router.get("/:universityId", auth, getUniversity);
router.put("/:universityId", auth, isUniversityAdmin, updateUniversity);

// Colleges under a university
router.get("/:universityId/colleges", auth, listCollegesByUniversity);
router.post("/:universityId/colleges", auth, isUniversityAdmin, createCollegeUnderUniversity);

export default router;
