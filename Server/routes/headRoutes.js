import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isHead } from "../middlewares/roles.js";
import {
  listDepartmentMembers,
  createMemberInviteLink,
  createMemberInviteByEmail,
} from "../controllers/headController.js";

const router = Router();

router.use(auth, isHead);

router.get("/members", listDepartmentMembers);
router.post("/members/invite-link", createMemberInviteLink);
router.post("/members/invite-email", createMemberInviteByEmail);

export default router;
