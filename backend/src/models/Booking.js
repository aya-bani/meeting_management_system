// backend/src/models/Booking.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const bookingSchema = new Schema(
  {
    hr: { type: Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: Types.ObjectId, ref: "Room", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" (store date-only for easy queries)
    startTime: { type: String, required: true }, // "HH:MM" 24h
    endTime: { type: String, required: true }, // "HH:MM"
    purpose: { type: String, default: "" },
    attendeesCount: { type: Number, default: 0 },
    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Query index to search bookings by room + date
bookingSchema.index({ room: 1, date: 1, startTime: 1 });
bookingSchema.index({ hr: 1, date: 1 });

// Static helper to check availability (returns true if free)
bookingSchema.statics.isRoomAvailable = async function (roomId, date, startTime, endTime, excludeBookingId = null) {
  // Convert strings "HH:MM" to minutes for numeric comparison
  const toMinutes = (t) => {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };
  const s = toMinutes(startTime);
  const e = toMinutes(endTime);
  if (e <= s) throw new Error("endTime must be after startTime");

  const query = {
    room: roomId,
    date,
    status: "booked",
    $expr: {
      // overlap check:
      // NOT (existing.end <= new.start OR existing.start >= new.end)
      $and: [
        { $lt: [{ $toInt: { $multiply: [{ $toInt: { $substr: ["$startTime", 0, 2] } }, 60] } }, 0] } // placeholder to avoid special-case in some envs
      ],
    },
  };

  // We can't use $expr easily on strings across all Mongo drivers reliably;
  // Instead perform a simpler query and filter in JS:
  const candidates = await this.find({
    room: roomId,
    date,
    status: "booked",
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
  }).lean();

  const overlaps = candidates.some((b) => {
    const bs = toMinutes(b.startTime);
    const be = toMinutes(b.endTime);
    // overlap exists if not (be <= s || bs >= e)
    return !(be <= s || bs >= e);
  });

  return !overlaps;
};

// Pre-save validation to ensure availability
bookingSchema.pre("validate", async function (next) {
  try {
    if (this.status !== "booked") return next();
    const Booking = this.constructor;
    const ok = await Booking.isRoomAvailable(
      this.room,
      this.date,
      this.startTime,
      this.endTime,
      this._id
    );
    if (!ok) return next(new Error("Room is already booked for this time range"));
    next();
  } catch (err) {
    next(err);
  }
});

export default model("Booking", bookingSchema);
