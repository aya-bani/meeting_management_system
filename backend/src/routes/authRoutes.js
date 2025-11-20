// backend/src/routes/authRoutes.js
import express from "express";
import { login, register } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/login", login);

// Admin only: create HR or Admin user
router.post("/register",  register);

export default router;
