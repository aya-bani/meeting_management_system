// backend/src/routes/reportRoutes.js
import express from "express";
import {
  getReports,
  createReport,
  updateReport,
  getMeetingSummary,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getReports); // Admin & HR can view
router.get("/meeting-summary", protect, getMeetingSummary); // Admin & HR can view
router.post("/", protect, authorize("hr"), createReport); // Only HR can report
router.put("/:id", protect, authorize("admin"), updateReport); // Admin resolves/fixes

export default router;
