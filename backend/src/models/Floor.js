import mongoose from "mongoose";
const { Schema, model } = mongoose;

const floorSchema = new Schema(
  {
    floorNumber: { type: Number, required: true }, 
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

floorSchema.index({ floorNumber: 1 }, { unique: true }); 

export default mongoose.models.Floor || model("Floor", floorSchema);
