import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllTeachers,
  getTeacherById,
  getTeacherReviews,
  addTeacherReview, 
  deleteTeacherReview
} from "../controllers/teacher.controller.js";

const router = Router();

// Public – teacher listing
router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);
// Protected – reviews
router.get("/:id/review", verifyJWT, getTeacherReviews);
router.post("/:id/review", verifyJWT, addTeacherReview);
router.delete(
  "/:teacherId/review/:reviewId",
  verifyJWT,
  deleteTeacherReview
);
export default router;
