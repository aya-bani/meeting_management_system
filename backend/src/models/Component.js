// backend/src/models/Component.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const componentSchema = new Schema(
  {
    room: { type: Types.ObjectId, ref: "Room", required: true, index: true },
    type: {
      type: String,
      enum: ["camera", "datashow", "whiteboard", "microphone", "screen", "speaker", "other"],
      required: true,
    },
    name: { type: String, required: true }, // e.g., "Logitech MeetUp"
    serialNumber: { type: String, trim: true, default: "" },
    quantity: { type: Number, default: 1, min: 0 },
    isWorking: { type: Boolean, default: true },
    lastChecked: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// index to quickly find broken components
componentSchema.index({ isWorking: 1 });
componentSchema.index({ room: 1, type: 1 });

export default model("Component", componentSchema);
