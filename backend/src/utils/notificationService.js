// backend/src/utils/notificationService.js
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * Create a notification for a user
 */
export const createNotification = async (recipientId, type, title, message, bookingId = null) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      booking: bookingId,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Notify admin users about a booking event
 */
export const notifyAdmins = async (type, title, message, bookingId = null) => {
  try {
    const admins = await User.find({ role: "admin", isActive: true });
    const notifications = await Promise.all(
      admins.map((admin) =>
        createNotification(admin._id, type, title, message, bookingId)
      )
    );
    return notifications;
  } catch (error) {
    console.error("Error notifying admins:", error);
    throw error;
  }
};

/**
 * Notify HR user about a booking event
 */
export const notifyHR = async (hrUserId, type, title, message, bookingId = null) => {
  try {
    return await createNotification(hrUserId, type, title, message, bookingId);
  } catch (error) {
    console.error("Error notifying HR:", error);
    throw error;
  }
};

