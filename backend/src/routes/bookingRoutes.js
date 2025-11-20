// backend/src/routes/bookingRoutes.js
import express from "express";
import {
  getBookings,
  createBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBookings); // Admin & HR can view
router.post("/", protect, authorize("hr"), createBooking); // Only HR can create
router.put("/:id/cancel", protect, authorize("admin", "hr"), cancelBooking); // Admin or HR who owns it

export default router;
