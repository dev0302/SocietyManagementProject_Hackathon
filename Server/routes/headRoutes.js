import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { isHead } from "../middlewares/roles.js";
import {
  createMemberInviteLink,
  createMemberInviteByEmail,
} from "../controllers/headController.js";

const router = Router();

router.use(auth, isHead);

router.post("/members/invite-link", createMemberInviteLink);
router.post("/members/invite-email", createMemberInviteByEmail);

export default router;
