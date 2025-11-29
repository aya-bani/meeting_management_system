// backend/src/controllers/componentController.js
import Component from "../models/Component.js";
import Room from "../models/Room.js";

// @desc Get all components (optionally by room)
export const getComponents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = req.query.room;
    const components = await Component.find(filter).populate("room");
    res.status(200).json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Add component to room (admin only)
export const createComponent = async (req, res) => {
  try {
    const { room, type, name, quantity, isWorking } = req.body;

    const roomExists = await Room.findById(room);
    if (!roomExists) return res.status(400).json({ message: "Room not found" });

    const component = await Component.create({ room, type, name, quantity, isWorking });
    // optionally push to room.components
    roomExists.components.push(component._id);
    await roomExists.save();

    res.status(201).json(component);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update component
export const updateComponent = async (req, res) => {
  try {
    const component = await Component.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!component) return res.status(404).json({ message: "Component not found" });
    res.status(200).json(component);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete component
export const deleteComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ message: "Component not found" });

    // remove from room.components
    const room = await Room.findById(component.room);
    if (room) {
      room.components = room.components.filter(c => c.toString() !== component._id.toString());
      await room.save();
    }

    await Component.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Component deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
