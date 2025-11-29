// backend/src/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Your account has been deactivated" 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Prepare user data - MUST include role
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    console.log('✅ Login successful:', { email: user.email, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: error.message 
    });
  }
};

// Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "All fields are required (name, email, password, role)" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: "User with this email already exists" 
      });
    }

    // Validate role
    if (!['admin', 'hr'].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Must be 'admin' or 'hr'" 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return user data
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive
    };

    console.log('✅ Registration successful:', { email: newUser.email, role: newUser.role });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: error.message 
    });
  }
};

// Get current user (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

// Logout (optional - mainly client-side)
export const logout = (req, res) => {
  res.status(200).json({ 
    message: "Logout successful" 
  });
};