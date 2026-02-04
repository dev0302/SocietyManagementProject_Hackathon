import { Router } from "express";
import {
  createSociety,
  updateSociety,
  createDepartment,
  createInvite,
  acceptInvite,
} from "../controllers/societyController.js";
import { auth } from "../middlewares/auth.js";
import { isFaculty, isCore, isHead } from "../middlewares/roles.js";

const router = Router();

// Faculty creates societies
router.post("/", auth, isFaculty, createSociety);

// Faculty updates their society (where they are coordinator)
router.patch("/:societyId", auth, isFaculty, updateSociety);

// Core creates departments within a society
router.post("/departments", auth, isCore, createDepartment);

// Invites – faculty/core/head depending on business rules
router.post("/invites", auth, createInvite);

// Student accepts invite
router.post("/invites/accept", auth, acceptInvite);

export default router;

