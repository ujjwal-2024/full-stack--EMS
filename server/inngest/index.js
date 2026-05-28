import { Inngest } from "inngest";
import Attendance from "../models/attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/leaveApplication.js";
import Payslip from "../models/Payslip.js";

export const inngest = new Inngest({
  id:       "worknest-ems",
  eventKey: "local",
  isDev:    true, // ✅ tells Inngest to skip signature verification in dev
});
// ── 1. Auto checkout every weekday at 5PM ───────────────────────────────────
const autoCheckout = inngest.createFunction(
  { id: "auto-checkout", triggers: [{ cron: "0 17 * * 1-5" }] },
  async ({ step }) => {
    await step.run("checkout-all-active", async () => {
      const now   = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeRecords = await Attendance.find({
        date:     today,
        checkIn:  { $exists: true },
        checkOut: null,
      });

      for (const record of activeRecords) {
        const hoursWorked = parseFloat(
          ((now - record.checkIn) / (1000 * 60 * 60)).toFixed(2)
        );
        let dayType;
        if (hoursWorked >= 8)      dayType = "Full Day";
        else if (hoursWorked >= 4) dayType = "Half Day";
        else                       dayType = "Short Day";

        record.checkOut     = now;
        record.workingHours = hoursWorked;
        record.dayType      = dayType;
        await record.save();
      }

      return { checkedOut: activeRecords.length };
    });
  }
);

// ── 2. Auto generate payslips on 1st of every month ─────────────────────────
const generateMonthlyPayslips = inngest.createFunction(
  { id: "generate-monthly-payslips", triggers: [{ cron: "0 0 1 * *" }] },
  async ({ step }) => {
    await step.run("generate-payslips", async () => {
      const now   = new Date();
      const month = now.getMonth() === 0 ? 12 : now.getMonth();
      const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      const employees = await Employee.find({ isDeleted: false });

      let generated = 0;
      for (const employee of employees) {
        const existing = await Payslip.findOne({ employeeId: employee._id, month, year });
        if (existing) continue;

        await Payslip.create({
          employeeId:  employee._id,
          month,
          year,
          basicSalary: employee.basicSalary || 0,
          allowances:  employee.allowances  || 0,
          deductions:  employee.deductions  || 0,
          netSalary:   (employee.basicSalary + employee.allowances - employee.deductions) || 0,
        });
        generated++;
      }

      return { generated, month, year };
    });
  }
);

// ── 3. Auto reject expired pending leaves daily at midnight ──────────────────
const autoRejectExpiredLeaves = inngest.createFunction(
  { id: "auto-reject-expired-leaves", triggers: [{ cron: "0 0 * * *" }] },
  async ({ step }) => {
    await step.run("reject-expired-leaves", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await LeaveApplication.updateMany(
        { status: "PENDING", startDate: { $lt: today } },
        {
          status:     "REJECTED",
          reviewNote: "Auto-rejected: Leave start date has passed without admin review.",
          reviewedAt: new Date(),
        }
      );

      return { rejected: result.modifiedCount };
    });
  }
);

// ── 4. On new employee created event ────────────────────────────────────────
const onEmployeeCreated = inngest.createFunction(
  { id: "on-employee-created", triggers: [{ event: "employee/created" }] },
  async ({ event, step }) => {
    await step.run("log-new-employee", async () => {
      const { name, email, department } = event.data;
      console.log(`New employee onboarded: ${name} (${email}) — ${department}`);
      return { message: `Welcome ${name} to WorkNest!` };
    });
  }
);

// ── 5. Mark absent employees every weekday at 5PM ───────────────────────────
const markAbsentEmployees = inngest.createFunction(
  { id: "mark-absent-employees", triggers: [{ cron: "0 17 * * 1-5" }] },
  async ({ step }) => {
    await step.run("mark-absent", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const employees = await Employee.find({ isDeleted: false });

      let marked = 0;
      for (const employee of employees) {
        const hasAttendance = await Attendance.findOne({
          employeeId: employee._id,
          date:       today,
        });
        if (hasAttendance) continue;

        const onLeave = await LeaveApplication.findOne({
          employeeID: employee._id,
          status:     "APPROVED",
          startDate:  { $lte: today },
          endDate:    { $gte: today },
        });
        if (onLeave) continue;

        await Attendance.create({
          employeeId:   employee._id,
          date:         today,
          status:       "ABSENT",
          workingHours: 0,
          dayType:      "Short Day",
        });
        marked++;
      }

      return { marked };
    });
  }
);

export const functions = [
  autoCheckout,
  generateMonthlyPayslips,
  autoRejectExpiredLeaves,
  onEmployeeCreated,
  markAbsentEmployees,
];