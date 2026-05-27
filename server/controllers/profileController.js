import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Get profile
// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const { userID, email, role } = req.user;

    const employee = await Employee.findOne({ userID })
      .populate("userID", "email role")
      .lean();

    // Authenticated user is not an employee — return admin profile
    if (!employee) {
      const admin = await User.findById(userID).lean();
      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({
        firstName: "Admin",
        lastName: "",
        email: admin.email,
        role: admin.role,
      });
    }

    return res.json({
      ...employee,
      id: employee._id.toString(),
      user: employee.userID
        ? { email: employee.userID.email, role: employee.userID.role }
        : null,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// Update profile
// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userID: req.user.userID }); // ✅ Bug 1 fixed
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });
    if (employee.isDeleted) {
      return res.status(404).json({ message: "Employee profile not found" });
    }                                                                      // ✅ Bug 2 fixed
    await Employee.findByIdAndUpdate(employee._id, { bio: req.body.bio });
    return res.json({ success: true });
  } catch (error) {                                                        // ✅ Bug 3 fixed
    return res.status(500).json({ message: "Error updating profile" });
  }
};