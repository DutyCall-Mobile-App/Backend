import express from "express";

const router = express.Router();
import {
  loginPolice,
  updateCredentials,
  getDashboardStats,
  getRecentReports,
  getPoliceNotifications,
} from "../controllers/policeController.js";
import authMiddleware from "../middleware/authMiddlewareP.js";

// Public routes
router.post("/login", loginPolice);

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.patch("/update-credentials", updateCredentials);
router.get("/dashboard/stats", getDashboardStats);
router.get("/reports/recent", getRecentReports);
router.get("/notifications", getPoliceNotifications);

export default router; // or whatever your router variable is called
