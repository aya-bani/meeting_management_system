// backend/src/controllers/componentController.js
import Component from "../models/Component.js";
import Room from "../models/Room.js";

// @desc Get all components (optionally by room)
export const getComponents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.room) filter.room = req.query.room;
    
    const components = await Component.find(filter)
      .populate({
        path: "room",
        populate: {
          path: "floor",
          model: "Floor"
        }
      });
    
    // Filter out components with invalid room references
    const validComponents = components.filter(component => 
      component.room !== null && 
      component.room !== undefined &&
      component.room._id !== undefined
    );
    
    res.status(200).json(validComponents);
  } catch (err) {
    console.error("Error fetching components:", err);
    res.status(500).json({ message: err.message || "Failed to fetch components" });
  }
};

// @desc Add component to room (admin only)
export const createComponent = async (req, res) => {
  try {
    console.log("📥 Incoming component data:", req.body);

    const { room, type, name, serialNumber, quantity, isWorking, notes } = req.body;

    // 1️⃣ Validate missing required fields
    if (!room || !type || !name) {
      return res.status(400).json({ message: "room, type and name are required fields" });
    }

    // 2️⃣ Validate allowed component type
    const allowedTypes = [
      "camera", "datashow", "whiteboard",
      "microphone", "screen", "speaker", "other"
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    // 3️⃣ Check if room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(400).json({ message: "Room not found" });
    }

    // 4️⃣ Create the component
    const component = await Component.create({
      room,
      type,
      name,
      serialNumber: serialNumber || "",
      quantity: quantity ?? 1,
      isWorking: isWorking ?? true,
      notes: notes || "",
    });

    // 5️⃣ Push component to the room array
    roomExists.components.push(component._id);
    await roomExists.save();

    return res.status(201).json(component);

  } catch (err) {
    console.error("❌ Component creation error:", err);
    return res.status(500).json({ message: err.message });
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
