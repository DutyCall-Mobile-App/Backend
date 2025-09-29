import Notification from "../models/notificationModel.js";

export const createNotification = async (data) => {
  const notification = new Notification(data);
  return await notification.save();
};

export const getNotifications = async () => {
  return await Notification.find().sort({ createdAt: -1 });
};

export const markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};
