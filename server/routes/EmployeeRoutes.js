import { Routes } from "express";
import {createEmployees , getEmployees, updateEmployees, deleteEmployees} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/auth.js";
const employeesRouter = Router();


employeesRouter.get("/", protect, protectAdmin, getEmployees);
employeesRouter.post("/", protect, protectAdmin, createEmployees);
employeesRouter.put("/:id", protect, protectAdmin, updateEmployees);
employeesRouter.delete("/:id", protect, protectAdmin, deleteEmployees);

export default employeesRouter;