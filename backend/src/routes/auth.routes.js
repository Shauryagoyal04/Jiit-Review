import { Router } from "express";
import { register, verifyOtp, login , getMe , forgotPassword , resetPassword } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", register);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.get("/me", verifyJWT, getMe); // ✅ NEW
router.post("/forgot-password", forgotPassword); // ✅ NEW
router.post("/reset-password/:token", resetPassword); // ✅ NEW
export default router;
