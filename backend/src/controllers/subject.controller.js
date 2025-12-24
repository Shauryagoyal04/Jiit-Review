import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subject } from "../models/subject.model.js";
import { SubjectReview } from "../models/subjectReview.js";

/* =========================
   GET ALL SUBJECTS
========================= */
export const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().sort({ semester: 1 });

  return res.json(
    new ApiResponse(200, subjects, "Subjects fetched successfully")
  );
});
/* =========================
   GET SUBJECT REVIEWS
========================= */
export const getSubjectReviews = asyncHandler(async (req, res) => {
  const { id: subjectId } = req.params;
  const userCampus = req.user.campus;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Campus check
  if (
    subject.campus !== "both" &&
    subject.campus !== userCampus
  ) {
    throw new ApiError(403, "You are not allowed to view reviews for this subject");
  }

  const reviews = await SubjectReview.find({ subjectId })
    .populate("userId", "campus")
    .sort({ createdAt: -1 });

  return res.json(
    new ApiResponse(200, reviews, "Subject reviews fetched successfully")
  );
});
/* =========================
   ADD SUBJECT REVIEW
========================= */
export const addSubjectReview = asyncHandler(async (req, res) => {
  const { id: subjectId } = req.params;
  const userId = req.user._id;
  const userCampus = req.user.campus;

  const {
    difficulty,
    content,
    examPattern,
    relativeMarks,
    textReview
  } = req.body;

  // Validation
  if (
    !difficulty ||
    !content ||
    !examPattern ||
    !relativeMarks
  ) {
    throw new ApiError(400, "All rating fields are required");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Campus rule
  if (
    subject.campus !== "both" &&
    subject.campus !== userCampus
  ) {
    throw new ApiError(403, "You cannot review this subject");
  }

  // Check duplicate review
  const existingReview = await SubjectReview.findOne({
    subjectId,
    userId
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this subject");
  }

  const review = await SubjectReview.create({
    subjectId,
    userId,
    campus: userCampus,
    ratings: {
      difficulty,
      content,
      examPattern,
      relativeMarks
    },
    textReview
  });

  return res.status(201).json(
    new ApiResponse(201, review, "Subject review added successfully")
  );
});
