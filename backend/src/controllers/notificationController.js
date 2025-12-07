// backend/src/controllers/notificationController.js
import Notification from "../models/Notification.js";

// @desc Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const { read } = req.query;
    const filter = { recipient: req.user._id };
    
    if (read !== undefined) {
      filter.read = read === "true";
    }

    const notifications = await Notification.find(filter)
      .populate("booking", "room date startTime endTime status")
      .populate("recipient", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user can only mark their own notifications as read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

