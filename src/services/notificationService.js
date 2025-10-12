import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const getNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid notification id");
  }

  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new Error("Notification not found");

  return notification;
};
