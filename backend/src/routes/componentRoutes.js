import express from "express";
import {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
} from "../controllers/componentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getComponents); // Admin & HR can view
router.post("/", protect, authorize("admin"), createComponent); // Admin only
router.put("/:id", protect, authorize("admin"), updateComponent);
router.delete("/:id", protect, authorize("admin"), deleteComponent);

export default router;
