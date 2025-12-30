import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllSubjects,
  getSubjectById,
  getSubjectReviews,
  addSubjectReview,
  deleteSubjectReview
} from "../controllers/subject.controller.js";

const router = Router();

// Public
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);      
// Protected
router.get("/:id/reviews", verifyJWT, getSubjectReviews);
router.post("/:id/reviews", verifyJWT, addSubjectReview);
router.delete(
  "/:subjectId/reviews/:reviewId",
  verifyJWT,
  deleteSubjectReview
);

export default router;
