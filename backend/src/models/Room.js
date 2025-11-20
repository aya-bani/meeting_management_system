// backend/src/models/Room.js
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const roomSchema = new Schema(
{
floor: { type: Types.ObjectId, ref: "Floor", required: true }, // removed index: true to avoid duplicates
name: { type: String, required: true, trim: true },
code: { type: String, trim: true }, // e.g., "A01"
capacity: { type: Number, default: 0 },
components: [{ type: Types.ObjectId, ref: "Component" }], // denormalized relation
status: { type: String, enum: ["available", "booked"], default: "available" },
location: { type: String }, // optional (GPS/floor map)
description: { type: String, default: "" },
},
{ timestamps: true }
);

// Compound index for quick lookup by floor + name
roomSchema.index({ floor: 1, name: 1 }, { unique: true });

// Virtual: number of components (computed)
roomSchema.virtual("componentsCount").get(function () {
return this.components ? this.components.length : 0;
});

// Enable virtuals in JSON and object output
roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

export default model("Room", roomSchema);
