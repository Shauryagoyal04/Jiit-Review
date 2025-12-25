import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllSubjects,
  getSubjectReviews,
  addSubjectReview
} from "../controllers/subject.controller.js";

const router = Router();

// Public
router.get("/", getAllSubjects);

// Protected
router.get("/:id/reviews", verifyJWT, getSubjectReviews);
router.post("/:id/reviews", verifyJWT, addSubjectReview);

export default router;
