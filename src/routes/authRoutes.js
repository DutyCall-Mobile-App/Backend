import express from "express";
const router = express.Router();
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getAllOfficersController,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import authorizeRole from "../middleware/roles.js";

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);
router.get("/me", protect, getMe);

// Police-only: get all officers
router.get(
  "/officers",
  protect,
  authorizeRole("policeman"),
  getAllOfficersController
);

export default router;
