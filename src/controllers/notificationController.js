import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../services/notificationService.js";
import { io } from "../socket.js"; // <-- import socket instance

export const createTestNotificationController = async (req, res) => {
  try {
    const { reportId, message, type } = req.body;

    const notification = await createNotification({
      reportId,
      message,
      type: type || "new_report",
    });

    // Emit via Socket.IO
    io.emit("notification", notification);

    res.status(201).json({
      success: true,
      message: "Test notification created",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Triggered when a report is created
export const notifyNewReport = async (report) => {
  const message = `New report submitted in category: ${report.category}`;
  const notification = await createNotification({
    reportId: report._id,
    message,
    type: "new_report",
  });

  // Send real-time notification via socket
  io.emit("notification", notification);

  return notification;
};

export const getAllNotificationsController = async (req, res) => {
  try {
    const notifications = await getNotifications();
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const updated = await markAsRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
