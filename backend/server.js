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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with detailed error handling
console.log("🔍 Attempting to connect to MongoDB Atlas...");
console.log("📝 Using connection string (password hidden):", process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@'));

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Database name:", mongoose.connection.name);
    console.log("📊 Host:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection FAILED!");
    console.error("❌ Error Type:", err.name);
    console.error("❌ Error Message:", err.message);
    
    // Specific error guidance
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("🔍 DNS lookup failed - Check your internet connection or connection string");
    } else if (err.message.includes("authentication failed") || err.message.includes("auth")) {
      console.error("🔑 Authentication failed - Check your username and password in .env");
    } else if (err.message.includes("timeout") || err.message.includes("timed out")) {
      console.error("🌐 Connection timeout - Check Network Access (IP whitelist) in MongoDB Atlas");
      console.error("   Go to: Network Access → Add IP Address → Allow Access From Anywhere (0.0.0.0/0)");
    }
    
    console.error("❌ Full error details:", err);
    // Don't exit - let server run for debugging
  });

// MongoDB connection event listeners
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose: Connected event fired");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose: Error event fired -", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose: Disconnected event fired");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 Mongoose: Reconnected to MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend is running...", 
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

// Database connection and health test route
app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    
    // Try to ping the database if connected
    let dbPing = null;
    if (dbState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        dbPing = "success";
      } catch (pingErr) {
        dbPing = "failed: " + pingErr.message;
      }
    }
    
    res.json({
      status: "OK",
      server: "running",
      database: {
        state: states[dbState],
        stateCode: dbState,
        name: mongoose.connection.name || "Not connected",
        host: mongoose.connection.host || "Not connected",
        ping: dbPing,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      error: err.message 
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/floors", floorRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});