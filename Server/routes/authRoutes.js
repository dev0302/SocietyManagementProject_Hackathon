import { Router } from "express";
import {
  registerAdmin,
  registerFaculty,
  registerStudent,
  login,
  changePassword,
  logout,
} from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Phase 1 & generic auth routes
router.post("/register/admin", registerAdmin);
router.post("/register/faculty", registerFaculty);
router.post("/register/student", registerStudent);
router.post("/login", login);
router.post("/change-password", auth, changePassword);
router.post("/logout", auth, logout);

export default router;

