import Employee from "../models/Employee.js";
import Payslip from "../models/Payslip.js";
import LeaveApplication from "../models/leaveApplication.js";
import Attendance from "../models/attendance.js";
import PDFDocument from "pdfkit";

// ── TAX BRACKETS (standard progressive tax — adjust to your country) ─────────
const calcIncomeTax = (annualSalary) => {
  let tax = 0;
  if      (annualSalary <= 50000)  tax = annualSalary * 0.05;
  else if (annualSalary <= 100000) tax = 2500  + (annualSalary - 50000)  * 0.10;
  else if (annualSalary <= 200000) tax = 7500  + (annualSalary - 100000) * 0.20;
  else                             tax = 27500 + (annualSalary - 200000) * 0.30;
  return parseFloat((tax / 12).toFixed(2)); // monthly tax
};

// ── HELPER: get working days in a month ─────────────────────────────────────
const getWorkingDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }
  return workingDays;
};

// ── HELPER: calculate full payslip breakdown ─────────────────────────────────
const calculatePayslip = async (employee, month, year) => {
  const basicSalary        = employee.salary || 0;

  // Standard allowances (adjust percentages to your company policy)
  const housingAllowance   = parseFloat((basicSalary * 0.20).toFixed(2));
  const transportAllowance = parseFloat((basicSalary * 0.10).toFixed(2));
  const mealAllowance      = parseFloat((basicSalary * 0.05).toFixed(2));
  const grossSalary        = basicSalary + housingAllowance + transportAllowance + mealAllowance;

  // ── Tax ──────────────────────────────────────────────────────────────────
  const incomeTax          = calcIncomeTax(basicSalary * 12);

  // ── Pension / Provident fund (standard 5% employee contribution) ─────────
  const pensionDeduction   = parseFloat((basicSalary * 0.05).toFixed(2));

  // ── Unpaid leave deductions ──────────────────────────────────────────────
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth   = new Date(year, month + 1, 0, 23, 59, 59);

  const rejectedLeaves = await LeaveApplication.find({
    employeeID: employee._id,
    type:       "UNPAID",
    status:     "APPROVED",
    startDate:  { $gte: startOfMonth, $lte: endOfMonth },
  });
  const unpaidLeaveDays   = rejectedLeaves.reduce((sum, l) => sum + l.totalDays, 0);
  const workingDays       = getWorkingDaysInMonth(year, month);
  const dailyRate         = parseFloat((basicSalary / workingDays).toFixed(2));
  const unpaidLeaveDeduct = parseFloat((dailyRate * unpaidLeaveDays).toFixed(2));

  // ── Overtime (attendance records with overtime flag) ─────────────────────
  const attendanceRecords = await Attendance.find({
    employeeId: employee._id,
    date:       { $gte: startOfMonth, $lte: endOfMonth },
    hoursWorked:{ $gt: 8 },
  });
  const overtimeHours  = attendanceRecords.reduce((sum, a) => sum + Math.max(0, (a.hoursWorked || 0) - 8), 0);
  const hourlyRate     = parseFloat((basicSalary / (workingDays * 8)).toFixed(2));
  const overtimePay    = parseFloat((overtimeHours * hourlyRate * 1.5).toFixed(2)); // 1.5x rate

  // ── Final calculations ───────────────────────────────────────────────────
  const totalDeductions = parseFloat((incomeTax + pensionDeduction + unpaidLeaveDeduct).toFixed(2));
  const netSalary       = parseFloat((grossSalary + overtimePay - totalDeductions).toFixed(2));

  return {
    basicSalary,
    allowances: {
      housing:   housingAllowance,
      transport: transportAllowance,
      meal:      mealAllowance,
      total:     parseFloat((housingAllowance + transportAllowance + mealAllowance).toFixed(2)),
    },
    overtime: {
      hours:  parseFloat(overtimeHours.toFixed(2)),
      amount: overtimePay,
    },
    deductions: {
      incomeTax,
      pension:     pensionDeduction,
      unpaidLeave: { days: unpaidLeaveDays, amount: unpaidLeaveDeduct },
      total:       totalDeductions,
    },
    grossSalary,
    netSalary,
    workingDays,
    dailyRate,
  };
};

// ── HELPER: generate PDF buffer ──────────────────────────────────────────────
const generatePayslipPDF = (payslip, employee) => {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data",  chunk => chunks.push(chunk));
    doc.on("end",   ()    => resolve(Buffer.concat(chunks)));
    doc.on("error", err   => reject(err));

    const { breakdown } = payslip;
    const monthName     = new Date(payslip.year, payslip.month - 1).toLocaleString("default", { month: "long" });

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(20).font("Helvetica-Bold").text("PAYSLIP", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(`${monthName} ${payslip.year}`, { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ── Employee Info ────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("Employee Details", { underline: true });
    doc.font("Helvetica").moveDown(0.5);
    doc.text(`Name:         ${employee.name}`);
    doc.text(`Department:   ${employee.department}`);
    doc.text(`Position:     ${employee.position}`);
    doc.text(`Employee ID:  ${employee._id}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ── Earnings ─────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("Earnings", { underline: true });
    doc.font("Helvetica").moveDown(0.5);
    doc.text(`Basic Salary:          $${breakdown.basicSalary.toLocaleString()}`);
    doc.text(`Housing Allowance:     $${breakdown.allowances.housing.toLocaleString()}`);
    doc.text(`Transport Allowance:   $${breakdown.allowances.transport.toLocaleString()}`);
    doc.text(`Meal Allowance:        $${breakdown.allowances.meal.toLocaleString()}`);
    doc.text(`Overtime (${breakdown.overtime.hours}hrs):    $${breakdown.overtime.amount.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text(`Gross Salary:          $${breakdown.grossSalary.toLocaleString()}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ── Deductions ───────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").text("Deductions", { underline: true });
    doc.font("Helvetica").moveDown(0.5);
    doc.text(`Income Tax:            $${breakdown.deductions.incomeTax.toLocaleString()}`);
    doc.text(`Pension (5%):          $${breakdown.deductions.pension.toLocaleString()}`);
    doc.text(`Unpaid Leave (${breakdown.deductions.unpaidLeave.days} days): $${breakdown.deductions.unpaidLeave.amount.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text(`Total Deductions:      $${breakdown.deductions.total.toLocaleString()}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ── Net Salary ───────────────────────────────────────────────────────────
    doc.fontSize(14).font("Helvetica-Bold")
      .text(`NET SALARY:            $${breakdown.netSalary.toLocaleString()}`, { align: "right" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke();
    doc.moveDown();

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.fontSize(9).font("Helvetica").fillColor("grey")
      .text("This is a system-generated payslip and does not require a signature.", { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.end();
  });
};

// CREATE payslip (Admin only)
// POST /api/payslips
export const createPayslip = async (req, res) => {
  try {
    const { role } = req.user;

    if (role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Only admins can generate payslips" });
    }

    const { employeeId, month, year } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "employeeId, month, and year are required" });
    }
    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.isDeleted) {
      return res.status(403).json({ message: "Cannot generate payslip for a deactivated employee" });
    }

    // Prevent duplicate payslip for the same month
    const existing = await Payslip.findOne({ employeeId, month, year });
    if (existing) {
      return res.status(400).json({
        message: `Payslip for ${employee.name} for ${month}/${year} already exists`,
        payslipId: existing._id,
      });
    }

    const breakdown = await calculatePayslip(employee, month - 1, year); // month-1 for JS Date

    const payslip = await Payslip.create({
      employeeId,
      month,
      year,
      breakdown,
      generatedBy: req.user.userID,
    });

    return res.status(201).json({
      message: "Payslip generated successfully",
      payslip,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET payslips
// GET /api/payslips?month=1&year=2024&employeeId=xxx&format=pdf
export const getPayslips = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { month, year, employeeId } = req.query;

    const filter = {};
    if (month)      filter.month = parseInt(month);
    if (year)       filter.year  = parseInt(year);

    // ── ADMIN: can view all payslips ─────────────────────────────────────
    if (role.toLowerCase() === "admin") {
      if (employeeId) filter.employeeId = employeeId;

      const payslips = await Payslip.find(filter)
        .populate("employeeId", "name department position")
        .populate("generatedBy", "email")
        .sort({ year: -1, month: -1 })
        .lean();

      return res.json({ payslips, total: payslips.length });
    }

    // ── EMPLOYEE: can only view their own ────────────────────────────────
    const employee = await Employee.findOne({ userID });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    filter.employeeId = employee._id;

    const payslips = await Payslip.find(filter)
      .sort({ year: -1, month: -1 })
      .lean();

    return res.json({ payslips, total: payslips.length });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET payslip by ID — JSON or PDF
// GET /api/payslips/:id?format=pdf
export const getPayslipById = async (req, res) => {
  try {
    const { userID, role } = req.user;
    const { id }           = req.params;
    const { format }       = req.query; // ?format=pdf

    const payslip = await Payslip.findById(id)
      .populate("employeeId", "name department position salary")
      .populate("generatedBy", "email");

    if (!payslip) {
      return res.status(404).json({ message: "Payslip not found" });
    }

    // Employees can only access their own payslip
    if (role.toLowerCase() === "employee") {
      const employee = await Employee.findOne({ userID });
      if (!employee || payslip.employeeId._id.toString() !== employee._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // ── PDF response ─────────────────────────────────────────────────────
    if (format === "pdf") {
      const pdfBuffer  = await generatePayslipPDF(payslip, payslip.employeeId);
      const monthName  = new Date(payslip.year, payslip.month - 1)
        .toLocaleString("default", { month: "long" });
      const filename   = `payslip_${payslip.employeeId.name}_${monthName}_${payslip.year}.pdf`
        .replace(/\s+/g, "_");

      res.setHeader("Content-Type",        "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    }

    // ── JSON response ─────────────────────────────────────────────────────
    return res.json({ payslip });

  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid payslip ID" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
