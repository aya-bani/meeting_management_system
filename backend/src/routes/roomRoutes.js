// backend/src/routes/roomRoutes.js
import express from "express";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRooms); // Admin & HR can view rooms
router.post("/", protect, authorize("admin"), createRoom); // Admin only
router.put("/:id", protect, authorize("admin"), updateRoom);
router.delete("/:id", protect, authorize("admin"), deleteRoom);

export default router;
