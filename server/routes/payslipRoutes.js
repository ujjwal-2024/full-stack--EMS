import { Router } from 'express';
import { protect, protectAdmin } from '../middleware/auth.js';
import { createPayslip, getPayslips, getPayslipById } from '../controllers/payslipController.js';

const payslipRouter = Router();

payslipRouter.post('/',    protect, protectAdmin, createPayslip);
payslipRouter.get('/:id',  protect, getPayslipById);
payslipRouter.get('/',     protect, getPayslips);

export default payslipRouter;