import mongoose from 'mongoose';
import { DEPARTMENTS } from '../utils/constants.js';

const employeeSchema = new mongoose.Schema({
  userID:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName:        { type: String, required: true },
  lastName:         { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  phone:            { type: String, required: true },
  position:         { type: String, required: true },
  department:       { type: String, enum: DEPARTMENTS },
  basicSalary:      { type: Number, default: 0 },
  allowances:       { type: Number, default: 0 },
  deductions:       { type: Number, default: 0 },
  employmentStatus: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }, // ✅ fixed
  joinDate:         { type: Date, required: true },
  image:            { type: String, default: null },                                    // ✅ added
  isDeleted:        { type: Boolean, default: false },
  bio:              { type: String, default: "" },
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;