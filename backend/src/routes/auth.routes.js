import { Router } from "express";
import { register, verifyOtp, login , getMe } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", register);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.get("/me", verifyJWT, getMe); // ✅ NEW

export default router;
