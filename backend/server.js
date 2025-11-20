// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import Routes
import authRoutes from "./src/routes/authRoutes.js";
import floorRoutes from "./src/routes/floorRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import componentRoutes from "./src/routes/componentRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
