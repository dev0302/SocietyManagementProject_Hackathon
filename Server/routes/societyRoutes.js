import { Router } from "express";
import {
  createSociety,
  updateSociety,
  createDepartment,
  createInvite,
  acceptInvite,
} from "../controllers/societyController.js";
import {
  getSocietyStudents,
  addSocietyStudents,
  uploadSocietyStudentsExcel,
} from "../controllers/societyStudentController.js";
import {
  getSocietyMembers,
  exportSocietyMembersExcel,
} from "../controllers/societyMemberController.js";
import { auth } from "../middlewares/auth.js";
import { isFaculty, isCore, isHead } from "../middlewares/roles.js";
import { requireRoles } from "../middlewares/roles.js";
import { ROLES } from "../config/roles.js";

const router = Router();

// Faculty creates societies
router.post("/", auth, isFaculty, createSociety);

// Faculty updates their society (where they are coordinator)
router.patch("/:societyId", auth, isFaculty, updateSociety);

// Society enrolled members (faculty coordinator or admin only)
router.get(
  "/:societyId/members/export",
  auth,
  requireRoles([ROLES.ADMIN, ROLES.FACULTY]),
  exportSocietyMembersExcel,
);
router.get(
  "/:societyId/members",
  auth,
  requireRoles([ROLES.ADMIN, ROLES.FACULTY]),
  getSocietyMembers,
);
// Society students roster / Excel upload (faculty coordinator or admin only)
router.get(
  "/:societyId/students",
  auth,
  requireRoles([ROLES.ADMIN, ROLES.FACULTY]),
  getSocietyStudents,
);
router.post(
  "/:societyId/students/upload",
  auth,
  requireRoles([ROLES.ADMIN, ROLES.FACULTY]),
  uploadSocietyStudentsExcel,
);
router.post(
  "/:societyId/students",
  auth,
  requireRoles([ROLES.ADMIN, ROLES.FACULTY]),
  addSocietyStudents,
);

// Core creates departments within a society
router.post("/departments", auth, isCore, createDepartment);

// Invites – faculty/core/head depending on business rules
router.post("/invites", auth, createInvite);

// Student accepts invite
router.post("/invites/accept", auth, acceptInvite);

export default router;

