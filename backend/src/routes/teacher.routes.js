import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllTeachers,
  getTeacherReviews,
  addTeacherReview
} from "../controllers/teacher.controller.js";

const router = Router();

// Public – teacher listing
router.get("/", getAllTeachers);

// Protected – reviews
router.get("/:id/review", verifyJWT, getTeacherReviews);
router.post("/:id/review", verifyJWT, addTeacherReview);

export default router;
