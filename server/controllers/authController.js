import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Login for employee and admin
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role_type } = req.body;

    if (!email || !password || !role_type) {
      return res.status(400).json({ message: "Email, password, and role_type are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check role matches what the client expects
    if (user.role.toLowerCase() !== role_type.toLowerCase()) {
      return res.status(401).json({ message: `Not authorized as ${role_type}` });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      userID: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: payload });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET session for employee and admin
// GET /api/auth/session
export const getSession = async (req, res) => {
  // req.user is populated by JWT middleware (e.g. verifyToken)
  return res.json({ user: req.user });
};

// Change password for employee and admin
// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed });

    return res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to change password" });
  }
};