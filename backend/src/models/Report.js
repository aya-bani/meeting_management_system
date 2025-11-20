// backend/src/models/Report.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const reportSchema = new Schema(
  {
    room: { type: Types.ObjectId, ref: "Room", required: true, index: true },
    component: { type: Types.ObjectId, ref: "Component", required: false },
    reportedBy: { type: Types.ObjectId, ref: "User", required: true, index: true },
    issue: { type: String, required: true },
    status: { type: String, enum: ["pending", "in_progress", "fixed"], default: "pending" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    notes: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, priority: -1, createdAt: 1 });

export default model("Report", reportSchema);
