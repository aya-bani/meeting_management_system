// backend/src/models/Booking.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const bookingSchema = new Schema(
  {
    hr: { type: Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: Types.ObjectId, ref: "Room", required: true, index: true },
    date: { type: String, required: true }, 
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, 
    purpose: { type: String, default: "" },
    attendeesCount: { type: Number, default: 0 },
    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, date: 1, startTime: 1 });
bookingSchema.index({ hr: 1, date: 1 });

bookingSchema.statics.isRoomAvailable = async function (roomId, date, startTime, endTime, excludeBookingId = null) {
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

      $and: [
        { $lt: [{ $toInt: { $multiply: [{ $toInt: { $substr: ["$startTime", 0, 2] } }, 60] } }, 0] } // placeholder to avoid special-case in some envs
      ],
    },
  };


  const candidates = await this.find({
    room: roomId,
    date,
    status: "booked",
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
  }).lean();

  const overlaps = candidates.some((b) => {
    const bs = toMinutes(b.startTime);
    const be = toMinutes(b.endTime);
    return !(be <= s || bs >= e);
  });

  return !overlaps;
};

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
