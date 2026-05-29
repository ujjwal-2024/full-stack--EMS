import express from 'express';
import cors from 'cors';
import "dotenv/config";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeesRouter from './routes/EmployeeRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import leaveRouter from './routes/leaveRoutes.js';
import payslipRouter from './routes/payslipRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(multer().none());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth',       authRouter);
app.use('/api/employees',  employeesRouter);
app.use('/api/profile',    profileRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave',      leaveRouter);
app.use('/api/payslips',   payslipRouter);
app.use('/api/dashboard',  dashboardRouter);
app.use('/api/inngest',    serve({ client: inngest, functions }));

// Serve React frontend (must be AFTER all API routes)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

await connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});