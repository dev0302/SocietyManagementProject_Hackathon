import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import {
  getMyProfile,
  updateProfile,
  updateDisplayPicture,
} from "../controllers/profileController.js";

const router = Router();

router.get("/me", auth, getMyProfile);
router.put("/", auth, updateProfile);
router.put("/avatar", auth, updateDisplayPicture);

export default router;

