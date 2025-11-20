// backend/src/controllers/floorController.js
import Floor from "../models/Floor.js";

// @desc Get all floors
export const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find().sort("floorNumber");
    res.status(200).json(floors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create a new floor (admin only)
export const createFloor = async (req, res) => {
  try {
    const { floorNumber, name, description } = req.body;
    const existing = await Floor.findOne({ floorNumber });
    if (existing) return res.status(400).json({ message: "Floor number already exists" });

    const floor = await Floor.create({ floorNumber, name, description });
    res.status(201).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update a floor (admin only)
export const updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    res.status(200).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete a floor (admin only)
export const deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    await floor.remove();
    res.status(200).json({ message: "Floor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
