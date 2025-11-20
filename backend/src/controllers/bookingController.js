// backend/src/controllers/bookingController.js
import Booking from "../models/Booking.js";

// @desc Get bookings (optionally by room or hr)
export const getBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = req.query.room;
    if (req.query.hr) filter.hr = req.query.hr;

    const bookings = await Booking.find(filter)
      .populate("hr", "name email role")
      .populate("room", "name floor code");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create booking (HR only)
export const createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body, hr: req.user._id, createdBy: req.user._id };
    const booking = await Booking.create(bookingData);
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

    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
