import Employee from "../models/Employee.js";
import Attendance from "../models/attendance.js";
import LeaveApplication from "../models/leaveApplication.js";
import Payslip from "../models/Payslip.js";
import { DEPARTMENTS } from "../utils/constants.js";

// GET dashboard for employee and admin
// GET /api/dashboard
export const getDashboard = async (req, res) => {
  try {
    const { userID, role } = req.user;

    // ── ADMIN DASHBOARD ────────────────────────────────────────────────────
    if (role.toLowerCase() === "admin") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalEmployees, todayAttendance, pendingLeaves] = await Promise.all([
        Employee.countDocuments({ isDeleted: false }),
        Attendance.countDocuments({ date: today }),
        LeaveApplication.countDocuments({ status: "PENDING" }),
      ]);

      return res.json({
        role:             "ADMIN",
        totalEmployees,
        totalDepartments: DEPARTMENTS.length,
        todayAttendance,
        pendingLeaves,
      });
    }

    // ── EMPLOYEE DASHBOARD ─────────────────────────────────────────────────
    const employee = await Employee.findOne({ userID });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Current month date range
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
      Attendance.countDocuments({
        employeeId: employee._id,
        date:       { $gte: startOfMonth, $lte: endOfMonth },
        status:     { $in: ["PRESENT", "LATE"] },
      }),
      LeaveApplication.countDocuments({
        employeeID: employee._id,
        status:     "PENDING",
      }),
      Payslip.findOne({ employeeId: employee._id })
        .sort({ year: -1, month: -1 })
        .lean(),
    ]);

    return res.json({
      role: "EMPLOYEE",
      currentMonthAttendance,
      pendingLeaves,
      latestPayslip: latestPayslip
        ? { netSalary: latestPayslip.netSalary }
        : null,
      employee: {
        firstName:  employee.firstName,
        lastName:   employee.lastName,
        position:   employee.position,
        department: employee.department,
        image:      employee.image,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};