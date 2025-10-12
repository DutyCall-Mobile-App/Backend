// routes/notificationRoutes.js
import express from "express";
import {
  getAllNotificationsController,
  markNotificationAsReadController,
  createTestNotificationController,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js"; // your middleware

const router = express.Router();

// Only authenticated users can access these routes
router.get("/", protect, getAllNotificationsController);
router.patch("/:id/read", protect, markNotificationAsReadController);
router.post("/test", protect, createTestNotificationController);

export default router;
