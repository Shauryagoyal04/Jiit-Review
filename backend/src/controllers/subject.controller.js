import { Subject } from "../models/subject.model.js";
import { SubjectReview } from "../models/subjectReview.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* =========================
   GET ALL SUBJECTS (PUBLIC)
   GET /api/subjects
   Optional filters: semester, type
========================= */
export const getAllSubjects = asyncHandler(async (req, res) => {
  const { semester, type } = req.query;

  const filter = {};
  if (semester) filter.semester = Number(semester);
  if (type) filter.type = type;

  const subjects = await Subject.find(filter).sort({
    semester: 1,
    name: 1
  });

  return res.json(
    new ApiResponse(200, subjects, "Subjects fetched successfully")
  );
});

/* =========================
   GET SUBJECT REVIEWS (🔒)
   GET /api/subjects/:id/reviews
========================= */
export const getSubjectReviews = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const reviews = await SubjectReview.find({ subjectId })
    .populate("userId", "email")
    .sort({ createdAt: -1 });

  let avgRatings = null;

  if (reviews.length > 0) {
    const totals = {
      difficulty: 0,
      content: 0,
      examPattern: 0,
      relativeMarks: 0
    };

    reviews.forEach((r) => {
      totals.difficulty += r.ratings.difficulty;
      totals.content += r.ratings.content;
      totals.examPattern += r.ratings.examPattern;
      totals.relativeMarks += r.ratings.relativeMarks;
    });

    avgRatings = {
      difficulty: (totals.difficulty / reviews.length).toFixed(1),
      content: (totals.content / reviews.length).toFixed(1),
      examPattern: (totals.examPattern / reviews.length).toFixed(1),
      relativeMarks: (totals.relativeMarks / reviews.length).toFixed(1)
    };
  }

  return res.json(
    new ApiResponse(
      200,
      {
        reviewsCount: reviews.length,
        avgRatings,
        reviews
      },
      "Subject reviews fetched successfully"
    )
  );
});

/* =========================
   ADD SUBJECT REVIEW (🔒)
   POST /api/subjects/:id/reviews
========================= */
export const addSubjectReview = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;
  const userId = req.user._id;

  const { difficulty, content, examPattern, relativeMarks, textReview } =
    req.body;

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
