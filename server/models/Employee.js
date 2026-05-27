import mongoose from 'mongoose';
import { DEPARTMENTS } from '../utils/constants.js';

const employeeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Fix: semicolon → colon
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  // Fix: removed duplicate email field
  phone: { type: String, required: true },
  position: { type: String, required: true },
  basicSalary: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  employeeStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  joinDate: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false },
  bio: { type: String, default: "" },
  department: { type: String, enum: DEPARTMENTS },
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;