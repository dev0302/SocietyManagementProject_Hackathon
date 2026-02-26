import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isCore } from "../middlewares/roles.js";
import {
  getMySociety,
  handleMemberDecision,
  handleMemberRoleChange,
  getDepartmentsSummary,
  listMyDepartmentHeads,
  listDepartments,
  createHeadInviteLink,
  createHeadInviteByEmail,
} from "../controllers/coreController.js";

const router = Router();

// All core-specific helper APIs
router.use(auth, isCore);

router.get("/my-society", getMySociety);
router.post("/members/decision", handleMemberDecision);
router.post("/members/role", handleMemberRoleChange);
router.get("/departments", listDepartments);
router.get("/departments/summary", getDepartmentsSummary);
router.get("/departments/my-heads", listMyDepartmentHeads);
router.post("/departments/invite-link", createHeadInviteLink);
router.post("/departments/invite-email", createHeadInviteByEmail);

export default router;

