import Employee from "../models/Employee.js";
import LeaveApplication from "../models/leaveApplication.js";

// Leave balance limits per type (in days) — real companies set these per year
const LEAVE_LIMITS = {
  SICK:       10,
  CASUAL:     12,
  ANNUAL:     18,
  UNPAID:     Infinity, // no limit
  MATERNITY:  90,
  PATERNITY:  14,
};

// ── HELPER: calculate working days between two dates (excludes weekends) ────
const calcWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // exclude Sunday (0) and Saturday (6)
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// ── HELPER: get used leave days for an employee in current year ─────────────
const getUsedLeaveDays = async (employeeID, type) => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const records = await LeaveApplication.find({
    employeeID,
    type,
    status:    { $in: ["APPROVED", "PENDING"] },
    startDate: { $gte: startOfYear },
  });
  return records.reduce((sum, r) => sum + r.totalDays, 0);
};

// CREATE leave
// POST /api/leaves
export const createLeave = async (req, res) => {
  try {
    const { userID, role } = req.user;

    // Only employees can apply for leave
    if (role.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Admins cannot apply for leave" });
    }

    const employee = await Employee.findOne({ userID });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.isDeleted) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact HR." });
    }

    const { type, startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Type, startDate, endDate, and reason are required" });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }
    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: "Leave cannot be applied for past dates" });
    }

    // Check for overlapping leave applications
    const overlap = await LeaveApplication.findOne({
      employeeID: employee._id,
      status:     { $in: ["PENDING", "APPROVED"] },
      $or: [
        { startDate: { $lte: end },   endDate: { $gte: start } },
      ],
    });
    if (overlap) {
      return res.status(400).json({
        message: "You already have a leave application overlapping these dates",
        existing: { startDate: overlap.startDate, endDate: overlap.endDate, status: overlap.status },
      });
    }

    const totalDays  = calcWorkingDays(start, end);
    const usedDays   = await getUsedLeaveDays(employee._id, type);
    const limit      = LEAVE_LIMITS[type] ?? 0;
    const remaining  = limit - usedDays;

    // Warn if balance is low — but don't block (admin makes final call)
    const warning = remaining !== Infinity && totalDays > remaining
      ? `Warning: You are applying for ${totalDays} days but only have ${remaining} ${type} days remaining. Your manager will review.`
      : null;

    const leave = await LeaveApplication.create({
      employeeID: employee._id,
      type,
      startDate:  start,
      endDate:    end,
      totalDays,
      reason,
      status:     "PENDING",
    });

    return res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
      ...(warning && { warning }),
      balance: {
        used:      usedDays + totalDays,
        remaining: Math.max(0, remaining - totalDays),
        limit:     limit === Infinity ? "Unlimited" : limit,
      },
    });

  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET leaves
// GET /api/leaves?status=PENDING&type=SICK&startDate=2024-01-01&endDate=2024-01-31&department=Engineering
export const getLeaves = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { status, type, startDate, endDate, department } = req.query;

    const filter = {};

    // ── Date range filter ──────────────────────────────────────────────────
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate)   filter.startDate.$lte = new Date(endDate);
    }

    if (status)     filter.status = status;
    if (type)       filter.type   = type;

    // ── ADMIN: sees all leaves, can filter by department ───────────────────
    if (role.toLowerCase() === "admin") {
      // If department filter is passed, find employees in that department first
      if (department) {
        const employees = await Employee.find({ department }).select("_id").lean();
        filter.employeeID = { $in: employees.map(e => e._id) };
      }

      const leaves = await LeaveApplication.find(filter)
        .populate("employeeID", "name department position")
        .populate("reviewedBy", "email")
        .sort({ createdAt: -1 })
        .lean();

      const summary = buildSummary(leaves);
      return res.json({ leaves, summary, total: leaves.length });
    }

    // ── EMPLOYEE: sees only their own leaves ───────────────────────────────
    const employee = await Employee.findOne({ userID });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    filter.employeeID = employee._id;

    const leaves = await LeaveApplication.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate balance per leave type for the employee
    const balances = await buildBalanceSummary(employee._id);
    const summary  = buildSummary(leaves);

    return res.json({ leaves, summary, balances, total: leaves.length });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE leave status (Admin only)
// PATCH /api/leaves/:id
export const updateLeaveStatus = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { id }           = req.params;
    const { status, reviewNote } = req.body;

    // ── EMPLOYEE: can only cancel their own PENDING leave ──────────────────
    if (role.toLowerCase() === "employee") {
      const employee = await Employee.findOne({ userID });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const leave = await LeaveApplication.findOne({ _id: id, employeeID: employee._id });
      if (!leave) {
        return res.status(404).json({ message: "Leave application not found" });
      }
      if (leave.status !== "PENDING") {
        return res.status(400).json({
          message: `Cannot cancel a leave that is already ${leave.status.toLowerCase()}`,
        });
      }

      leave.status = "CANCELLED";
      await leave.save();
      return res.json({ message: "Leave application cancelled successfully", leave });
    }

    // ── ADMIN: can approve or reject any leave ─────────────────────────────
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
    }
    if (status === "REJECTED" && !reviewNote) {
      return res.status(400).json({ message: "A reason is required when rejecting a leave" });
    }

    const leave = await LeaveApplication.findById(id).populate("employeeID", "name department");
    if (!leave) {
      return res.status(404).json({ message: "Leave application not found" });
    }
    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: `This leave has already been ${leave.status.toLowerCase()}`,
      });
    }

    leave.status     = status;
    leave.reviewedBy = userID;
    leave.reviewedAt = new Date();
    if (reviewNote)  leave.reviewNote = reviewNote;

    await leave.save();

    return res.json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });

  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid leave ID" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── HELPER: summarize leave records ─────────────────────────────────────────
const buildSummary = (leaves) => ({
  total:     leaves.length,
  pending:   leaves.filter(l => l.status === "PENDING").length,
  approved:  leaves.filter(l => l.status === "APPROVED").length,
  rejected:  leaves.filter(l => l.status === "REJECTED").length,
  cancelled: leaves.filter(l => l.status === "CANCELLED").length,
});

// ── HELPER: balance per leave type for an employee ───────────────────────────
const buildBalanceSummary = async (employeeID) => {
  const balances = {};
  for (const [type, limit] of Object.entries(LEAVE_LIMITS)) {
    const used      = await getUsedLeaveDays(employeeID, type);
    const remaining = limit === Infinity ? "Unlimited" : Math.max(0, limit - used);
    balances[type]  = { limit: limit === Infinity ? "Unlimited" : limit, used, remaining };
  }
  return balances;
};
