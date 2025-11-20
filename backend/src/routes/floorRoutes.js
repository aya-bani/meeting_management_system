// backend/src/routes/floorRoutes.js
import express from "express";
import {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
} from "../controllers/floorController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFloors);
router.post("/", protect, authorize("admin"), createFloor);
router.put("/:id", protect, authorize("admin"), updateFloor);
router.delete("/:id", protect, authorize("admin"), deleteFloor);

export default router;
