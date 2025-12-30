import { Subject } from "../models/subject.model.js";
import { SubjectReview } from "../models/subjectReview.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* =========================
   GET ALL SUBJECTS (PUBLIC)
========================= */
export const getAllSubjects = asyncHandler(async (req, res) => {
  // Fetch all subjects
  const subjects = await Subject.find().sort({ name: 1 });

  console.log(`📚 Found ${subjects.length} subjects`);

  // For each subject, calculate their average rating
  const subjectsWithRatings = await Promise.all(
    subjects.map(async (subject) => {
      const reviews = await SubjectReview.find({ subjectId: subject._id });
      
      console.log(`📝 Subject "${subject.name}" has ${reviews.length} reviews`);
      
      let overallRating = null;
      let reviewCount = reviews.length;

      if (reviews.length > 0) {
        // Calculate totals for all rating categories
        const totals = reviews.reduce((acc, review) => {
          Object.keys(review.ratings).forEach(key => {
            acc[key] = (acc[key] || 0) + review.ratings[key];
          });
          return acc;
        }, {});

        // Calculate average for each category
        const avgRatings = {};
        Object.keys(totals).forEach(key => {
          avgRatings[key] = totals[key] / reviews.length;
        });

        // Calculate overall rating (average of all category averages)
        const categoryAverages = Object.values(avgRatings);
        overallRating = Number(
          (categoryAverages.reduce((a, b) => a + b, 0) / categoryAverages.length).toFixed(1)
        );

        console.log(`⭐ Subject "${subject.name}" overall rating: ${overallRating}`);
      }

      return {
        ...subject.toObject(),
        overallRating,
        reviewCount
      };
    })
  );

  console.log(`✅ Returning ${subjectsWithRatings.length} subjects with ratings`);

  return res.json(
    new ApiResponse(200, subjectsWithRatings, "Subjects fetched successfully")
  );
});

/* =========================
   GET SUBJECT BY ID (PUBLIC)
========================= */
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // Calculate ratings for this specific subject
  const reviews = await SubjectReview.find({ subjectId: subject._id });
  
  console.log(`📝 Subject "${subject.name}" has ${reviews.length} reviews`);
  
  let overallRating = null;
  let reviewCount = reviews.length;

  if (reviews.length > 0) {
    // Calculate totals for all rating categories
    const totals = reviews.reduce((acc, review) => {
      Object.keys(review.ratings).forEach(key => {
        acc[key] = (acc[key] || 0) + review.ratings[key];
      });
      return acc;
    }, {});

    // Calculate average for each category
    const avgRatings = {};
    Object.keys(totals).forEach(key => {
      avgRatings[key] = totals[key] / reviews.length;
    });

    // Calculate overall rating (average of all category averages)
    const categoryAverages = Object.values(avgRatings);
    overallRating = Number(
      (categoryAverages.reduce((a, b) => a + b, 0) / categoryAverages.length).toFixed(1)
    );

    console.log(`⭐ Subject "${subject.name}" overall rating: ${overallRating}`);
  }

  return res.json(
    new ApiResponse(200, { ...subject.toObject(), overallRating, reviewCount }, "Subject fetched successfully")
  );
});

/* =========================
   GET SUBJECT REVIEWS (🔒)
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
    // Calculate totals for all rating categories dynamically
    const totals = reviews.reduce((acc, review) => {
      Object.keys(review.ratings).forEach(key => {
        acc[key] = (acc[key] || 0) + review.ratings[key];
      });
      return acc;
    }, {});

    // Calculate average for each category
    avgRatings = {};
    Object.keys(totals).forEach(key => {
      avgRatings[key] = Number((totals[key] / reviews.length).toFixed(1));
    });

    // Calculate overall rating (average of all category averages)
    const categoryAverages = Object.values(avgRatings);
    overallRating = Number(
      (categoryAverages.reduce((a, b) => a + b, 0) / categoryAverages.length).toFixed(1)
    );
  }

  return res.json(
    new ApiResponse(
      200, 
      { reviewsCount: reviews.length, avgRatings, overallRating, reviews }, 
      "Subject reviews fetched successfully"
    )
  );
});

/* =========================
   ADD SUBJECT REVIEW (🔒)
========================= */
export const addSubjectReview = asyncHandler(async (req, res) => {
  const subjectId = req.params.id;
  const userId = req.user._id;

  const { ratings, textReview } = req.body;

  // Validate that ratings exist and are objects
  if (!ratings || typeof ratings !== 'object') {
    throw new ApiError(400, "Ratings object is required");
  }

  // Validate all ratings are between 1 and 5
  const ratingValues = Object.values(ratings);
  if (ratingValues.some((r) => r < 1 || r > 5)) {
    throw new ApiError(400, "All ratings must be between 1 and 5");
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  // 🚫 Prevent duplicate review
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
    ratings,
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