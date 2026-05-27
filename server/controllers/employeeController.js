import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// GET employees
// GET /api/employees
export const getEmployees = async (req, res) => {
  try {
    const { department } = req.query;
    const where = {};
    if (department) where.department = department;

    const employees = await Employee.find(where)
      .sort({ created: -1 })
      .populate("userID", "email role")
      .lean();

    const result = employees.map(employee => ({
      ...employee,
      id: employee._id.toString(),
      user: employee.userID
        ? { email: employee.userID.email, role: employee.userID.role }
        : null,
    }));

    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching employees" });
  }
};

// CREATE employee
// POST /api/employees
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      department,
      position,
      salary,
      phone,
      address,
      userID,
    } = req.body;

    // Validate required fields
    if (!name || !department || !position) {
      return res.status(400).json({ message: "Name, department, and position are required" });
    }

    const employee = new Employee({
      name,
      department,
      position,
      salary,
      phone,
      address,
      userID: userID || null,
    });

    const saved = await employee.save();

    await saved.populate("userID", "email role");

    res.status(201).json({
      ...saved.toObject(),
      id: saved._id.toString(),
      user: saved.userID
        ? { email: saved.userID.email, role: saved.userID.role }
        : null,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error creating employee" });
  }
};

// UPDATE employee
// PUT /api/employees/:id


// UPDATE employee
// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      department,
      position,
      salary,
      phone,
      address,
      userID,
      password,
    } = req.body;

    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Handle password update on the linked User document
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const linkedUserID = userID || employee.userID;
      if (!linkedUserID) {
        return res.status(400).json({ message: "No linked user account found to update password" });
      }

      const user = await User.findById(linkedUserID);
      if (!user) {
        return res.status(404).json({ message: "Linked user account not found" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    // Update employee fields
    if (name !== undefined)       employee.name       = name;
    if (department !== undefined) employee.department = department;
    if (position !== undefined)   employee.position   = position;
    if (salary !== undefined)     employee.salary     = salary;
    if (phone !== undefined)      employee.phone      = phone;
    if (address !== undefined)    employee.address    = address;
    if (userID !== undefined)     employee.userID     = userID;

    const updated = await employee.save();
    await updated.populate("userID", "email role"); // password excluded

    res.json({
      ...updated.toObject(),
      id: updated._id.toString(),
      user: updated.userID
        ? { email: updated.userID.email, role: updated.userID.role }
        : null,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    return res.status(500).json({ message: "Error updating employee" });
  }
};

// DELETE employee
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.deleteOne();

    res.json({
      message: "Employee deleted successfully",
      id,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    return res.status(500).json({ message: "Error deleting employee" });
  }
};
