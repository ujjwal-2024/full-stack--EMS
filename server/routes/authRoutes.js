import { Router } from "express";
import { login, Session, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/session",protect, Session);
authRouter.post("/change-password",protect, changePassword);

export default authRouter;
