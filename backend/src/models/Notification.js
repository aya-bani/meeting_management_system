// backend/src/models/Notification.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Types.ObjectId, ref: "User", required: true, index: true },
    type: { 
      type: String, 
      enum: ["booking_created", "booking_canceled"], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    booking: { type: Types.ObjectId, ref: "Booking", required: false },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default model("Notification", notificationSchema);

