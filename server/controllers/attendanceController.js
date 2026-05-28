import Employee from '../models/Employee.js';
import Attendance from '../models/attendance.js';

// Clock in / Clock out toggle
// POST /api/attendance/clock
export const clockInOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userID: req.user.userID });  // ✅ fixed req.session → req.user
    if (!employee) {                                                         // ✅ fixed typo employoee → employee
      return res.status(404).json({ message: "Employee not found" });
    }                                                                        // ✅ fixed missing closing } for if(!employee)
    if (employee.isDeleted) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact HR." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });

    // ── CLOCK OUT ──────────────────────────────────────────────────────────
    if (existing) {
      if (existing.checkOut) {
        // Already clocked out — prevent duplicate
        return res.status(400).json({
          message: "You have already completed your shift for today.",
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          hoursWorked: existing.hoursWorked,
        });
      }

      // Record check-out time and calculate hours worked
      const hoursWorked = parseFloat(
        ((now - existing.checkIn) / (1000 * 60 * 60)).toFixed(2)
      );

      // Determine day type based on hours worked
      let dayType;
      if (hoursWorked >= 8)       dayType = "FULL DAY";
      else if (hoursWorked >= 4)  dayType = "HALF DAY";
      else                        dayType = "SHORT DAY";

      existing.checkOut   = now;
      existing.hoursWorked = hoursWorked;
      existing.dayType    = dayType;
      await existing.save();

      return res.json({
        message: "Clocked out successfully",
        checkIn: existing.checkIn,
        checkOut: existing.checkOut,
        hoursWorked,
        dayType,
        status: existing.status,
      });
    }

    // ── CLOCK IN ───────────────────────────────────────────────────────────
    const hour    = now.getHours();
    const minutes = now.getMinutes();

    // Grace period: up to 9:15 AM is on time
    const isLate  = hour > 9 || (hour === 9 && minutes > 15);
    const status  = isLate ? "LATE" : "PRESENT";

    const attendance = await Attendance.create({
      employeeId: employee._id,
      date:       today,
      checkIn:    now,
      status,
      dayType:    "PENDING", // finalized on clock-out
    });

    return res.json({
      message: isLate
        ? `Clocked in late at ${now.toLocaleTimeString()}. Your manager has been notified.`
        : "Clocked in successfully. Have a great day!",
      checkIn: attendance.checkIn,
      status,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get attendance records
// GET /api/attendance?startDate=2024-01-01&endDate=2024-01-31&employeeId=xxx
export const getAttendance = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { startDate, endDate, employeeId } = req.query;

    // ── BUILD DATE FILTER ──────────────────────────────────────────────────
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include full end day
        dateFilter.date.$lte = end;
      }
    } else {
      // Default: current month if no date range provided
      const now = new Date();
      dateFilter.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    // ── ADMIN: can view any employee's records ─────────────────────────────
    if (role.toLowerCase() === "admin") {
      const filter = { ...dateFilter };
      if (employeeId) filter.employeeId = employeeId;

      const records = await Attendance.find(filter)
        .populate("employeeId", "name department position")
        .sort({ date: -1 })
        .lean();

      const summary = buildSummary(records);

      return res.json({ records, summary, total: records.length });
    }

    // ── EMPLOYEE: can only view their own records ──────────────────────────
    const employee = await Employee.findOne({ userID });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const records = await Attendance.find({ employeeId: employee._id, ...dateFilter })
      .sort({ date: -1 })
      .lean();

    const summary = buildSummary(records);

    return res.json({ records, summary, total: records.length });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── HELPER: summarize attendance records ────────────────────────────────────
const buildSummary = (records) => ({
  totalDays:    records.length,
  present:      records.filter(r => r.status === "PRESENT").length,
  late:         records.filter(r => r.status === "LATE").length,
  absent:       records.filter(r => r.status === "ABSENT").length,
  fullDays:     records.filter(r => r.dayType === "FULL DAY").length,
  halfDays:     records.filter(r => r.dayType === "HALF DAY").length,
  shortDays:    records.filter(r => r.dayType === "SHORT DAY").length,
  totalHours:   parseFloat(
    records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0).toFixed(2)
  ),
});
