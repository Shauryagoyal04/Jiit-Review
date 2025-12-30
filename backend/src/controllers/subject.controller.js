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


export const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find subject
  const subject = await Subject.findById(id);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Optionally, include reviews and avg ratings
  const reviews = await SubjectReview.find({ subjectId: id });

  let avgRatings = null;
  let overallRating = null;

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
      difficulty: parseFloat((totals.difficulty / reviews.length).toFixed(1)),
      content: parseFloat((totals.content / reviews.length).toFixed(1)),
      examPattern: parseFloat((totals.examPattern / reviews.length).toFixed(1)),
      relativeMarks: parseFloat((totals.relativeMarks / reviews.length).toFixed(1))
    };

    // Calculate overall rating (average of all 4 ratings)
    overallRating = parseFloat((
      (avgRatings.difficulty + avgRatings.content + avgRatings.examPattern + avgRatings.relativeMarks) / 4
    ).toFixed(1));
  }

  return res.status(200).json(
    new ApiResponse(200, {
      subject,
      reviewsCount: reviews.length,
      avgRatings,
      overallRating,
      reviews
    }, "Subject fetched successfully")
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
    .sort({ createdAt: -1 });

  let avgRatings = null;
  let overallRating = null;

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
      difficulty: parseFloat((totals.difficulty / reviews.length).toFixed(1)),
      content: parseFloat((totals.content / reviews.length).toFixed(1)),
      examPattern: parseFloat((totals.examPattern / reviews.length).toFixed(1)),
      relativeMarks: parseFloat((totals.relativeMarks / reviews.length).toFixed(1))
    };

    // Calculate overall rating (average of all 4 ratings)
    overallRating = parseFloat((
      (avgRatings.difficulty + avgRatings.content + avgRatings.examPattern + avgRatings.relativeMarks) / 4
    ).toFixed(1));
  }

  return res.json(
    new ApiResponse(
      200,
      {
        reviewsCount: reviews.length,
        avgRatings,
        overallRating,
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
/* =========================
   DELETE SUBJECT REVIEW (🔒)
   DELETE /api/subjects/:subjectId/reviews/:reviewId
========================= */
export const deleteSubjectReview = asyncHandler(async (req, res) => {
  const { subjectId, reviewId } = req.params;
  const userId = req.user._id;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const review = await SubjectReview.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this review");
  }

  await review.deleteOne();

  return res.json(
    new ApiResponse(200, null, "Subject review deleted successfully")
  );
});
