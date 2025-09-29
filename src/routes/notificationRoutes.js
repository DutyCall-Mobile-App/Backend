import express from "express";
import {
  getAllNotificationsController,
  markNotificationAsReadController,
  createTestNotificationController, //Test
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getAllNotificationsController);
router.patch("/:id/read", markNotificationAsReadController);

// ✅ POST route to create a test notification
router.post("/test", createTestNotificationController);

export default router;
