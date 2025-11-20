// backend/src/controllers/roomController.js
import Room from "../models/Room.js";
import Floor from "../models/Floor.js";
import Component from "../models/Component.js";

// @desc Get all rooms (optionally by floor)
export const getRooms = async (req, res) => {
  try {
    const filter = {};
    if (req.query.floor) filter.floor = req.query.floor;
    const rooms = await Room.find(filter).populate("floor").populate("components");
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create room (admin only)
export const createRoom = async (req, res) => {
  try {
    const { floor, name, code, capacity } = req.body;
    const floorExists = await Floor.findById(floor);
    if (!floorExists) return res.status(400).json({ message: "Floor not found" });

    const room = await Room.create({ floor, name, code, capacity });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update room (admin only)
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete room (admin only)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Remove components in that room
    await Component.deleteMany({ room: room._id });
    await room.remove();
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
