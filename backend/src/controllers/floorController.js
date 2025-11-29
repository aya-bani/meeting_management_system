// backend/src/controllers/floorController.js
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";

// @desc Get all floors
export const getFloors = async (req, res) => {
  try {
    const floors = await Floor.find().populate("rooms");
    res.status(200).json(floors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create floor (admin only)
export const createFloor = async (req, res) => {
  try {
    const { floorNumber, name, description } = req.body;

    // Validation
    if (!floorNumber || !name) {
      return res.status(400).json({ message: "Floor number and name are required" });
    }

    // Check if floor number already exists
    const existingFloor = await Floor.findOne({ floorNumber });
    if (existingFloor) {
      return res.status(400).json({ message: "Floor number already exists" });
    }

    const floor = await Floor.create({ floorNumber, name, description });
    res.status(201).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update floor (admin only)
export const updateFloor = async (req, res) => {
  try {
    const { floorNumber, name, description } = req.body;

    // If floorNumber is being updated, check if it already exists
    if (floorNumber) {
      const existingFloor = await Floor.findOne({ 
        floorNumber, 
        _id: { $ne: req.params.id } 
      });
      if (existingFloor) {
        return res.status(400).json({ message: "Floor number already exists" });
      }
    }

    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      { floorNumber, name, description },
      { new: true, runValidators: true }
    );

    if (!floor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    res.status(200).json(floor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete floor (admin only)
export const deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);
    if (!floor) {
      return res.status(404).json({ message: "Floor not found" });
    }

    // Delete all rooms in this floor
    await Room.deleteMany({ floor: floor._id });

    // Delete the floor
    await Floor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Floor and associated rooms deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
