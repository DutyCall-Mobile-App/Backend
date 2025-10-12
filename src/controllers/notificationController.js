// controllers/notificationController.js
import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../services/notificationService.js";
import { io } from "../socket.js";

export const getAllNotificationsController = async (req, res) => {
  try {
    const notifications = await getNotifications(req.user._id); // 👈 use logged-in user
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const notifyNewReport = async (report) => {
  try {
    if (!report.user) return;

    const message = `New report submitted in category: ${report.category}`;
    const notification = await createNotification({
      user: report.user,
      message,
      type: "new_report",
      reportId: report._id,
    });

    // Emit real-time notification to the user via Socket.IO
    io.emit("notification", notification);

    console.log("Notification sent successfully:", notification.message);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};


export const markNotificationAsReadController = async (req, res) => {
  try {
    const updated = await markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Test: create notification for logged user
export const createTestNotificationController = async (req, res) => {
  try {
    const { reportId, message, type } = req.body;

    const notification = await createNotification({
      user: req.user._id, // 👈 store current user
      reportId,
      message,
      type: type || "new_report",
    });

    // Emit to user's room (if using sockets)
    io.to(report.user.toString()).emit("notification", notification);

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
