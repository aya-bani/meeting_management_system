// backend/src/controllers/bookingController.js
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { notifyAdmins, notifyHR } from "../utils/notificationService.js";

// @desc Get bookings (optionally by room or hr)
export const getBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = req.query.room;
    if (req.query.hr) filter.hr = req.query.hr;

    const bookings = await Booking.find(filter)
      .populate("hr", "name email role")
      .populate({
        path: "room",
        select: "name floor code",
        populate: {
          path: "floor",
          model: "Floor",
          select: "name floorNumber"
        }
      });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create booking (HR only)
export const createBooking = async (req, res) => {
  try {
    const { room, date, startTime, endTime } = req.body;
    
    // Rule 1: Check for double booking - explicit check before creating
    const isAvailable = await Booking.isRoomAvailable(room, date, startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({ message: "Room is already booked for this time range" });
    }

    const bookingData = { ...req.body, hr: req.user._id, createdBy: req.user._id };
    const booking = await Booking.create(bookingData);
    
    // Populate booking for notifications
    await booking.populate("hr", "name email role");
    await booking.populate({
      path: "room",
      select: "name floor code",
      populate: {
        path: "floor",
        model: "Floor",
        select: "name floorNumber"
      }
    });
    
    // Rule 4: Auto Notifications - CREATE booking → notify admin + HR user dashboard
    try {
      const roomName = booking.room?.name || "Room";
      const hrName = booking.hr?.name || "HR Manager";
      
      // Notify all admins
      await notifyAdmins(
        "booking_created",
        "New Booking Created",
        `${hrName} has created a new booking for ${roomName} on ${booking.date} from ${booking.startTime} to ${booking.endTime}`,
        booking._id
      );
      
      // Notify HR user (the one who created the booking)
      await notifyHR(
        req.user._id,
        "booking_created",
        "Booking Confirmed",
        `Your booking for ${roomName} on ${booking.date} from ${booking.startTime} to ${booking.endTime} has been confirmed.`,
        booking._id
      );
    } catch (notifError) {
      // Log error but don't fail the booking creation
      console.error("Error sending notifications:", notifError);
    }
    
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc Cancel booking (HR or Admin)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // HR can cancel their own booking, admin can cancel any
    if (req.user.role === "hr" && booking.hr.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Rule 2 & 3: Set canceledBy based on who is canceling
    if (req.user.role === "admin") {
      booking.canceledBy = "admin";
    } else {
      booking.canceledBy = "user";
    }
    
    booking.status = "canceled";
    await booking.save();
    
    // Populate booking for notifications
    await booking.populate("hr", "name email role");
    await booking.populate({
      path: "room",
      select: "name floor code",
      populate: {
        path: "floor",
        model: "Floor",
        select: "name floorNumber"
      }
    });
    
    // Rule 4: Auto Notifications - CANCEL booking → notify both sides depending on trigger
    try {
      const roomName = booking.room?.name || "Room";
      const hrName = booking.hr?.name || "HR Manager";
      const hrUserId = booking.hr?._id || booking.hr;
      
      if (req.user.role === "admin") {
        // Rule 2: Admin cancels → notify HR manager
        await notifyHR(
          hrUserId,
          "booking_canceled",
          "Booking Canceled by Admin",
          `Your booking for ${roomName} on ${booking.date} from ${booking.startTime} to ${booking.endTime} has been canceled by an administrator.`,
          booking._id
        );
      } else {
        // Rule 3: HR cancels → notify admin
        await notifyAdmins(
          "booking_canceled",
          "Booking Canceled by HR",
          `${hrName} has canceled their booking for ${roomName} on ${booking.date} from ${booking.startTime} to ${booking.endTime}`,
          booking._id
        );
      }
    } catch (notifError) {
      // Log error but don't fail the cancellation
      console.error("Error sending notifications:", notifError);
    }
    
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
