import { Teacher } from "../models/teacher.model.js";
import { TeacherReview } from "../models/teacherReview.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* =========================
   GET ALL TEACHERS (PUBLIC)
========================= */
export const getAllTeachers = asyncHandler(async (req, res) => {
  // Fetch all teachers
  const teachers = await Teacher.find().sort({ name: 1 });

  // For each teacher, calculate their average rating
  const teachersWithRatings = await Promise.all(
    teachers.map(async (teacher) => {
      const reviews = await TeacherReview.find({ teacherId: teacher._id });
      
      let overallRating = null;
      let reviewCount = reviews.length;

      if (reviews.length > 0) {
        const totals = { lateEntry: 0, taMarks: 0, clarity: 0, attendance: 0 };
        reviews.forEach(r => {
          totals.lateEntry += r.ratings.lateEntry;
          totals.taMarks += r.ratings.taMarks;
          totals.clarity += r.ratings.clarity;
          totals.attendance += r.ratings.attendance;
        });

        const avgRatings = {
          lateEntry: totals.lateEntry / reviews.length,
          taMarks: totals.taMarks / reviews.length,
          clarity: totals.clarity / reviews.length,
          attendance: totals.attendance / reviews.length
        };

        overallRating = Number(
          ((avgRatings.lateEntry + avgRatings.taMarks + avgRatings.clarity + avgRatings.attendance) / 4).toFixed(1)
        );
      }

      return {
        ...teacher.toObject(),
        overallRating,
        reviewCount
      };
    })
  );

  return res.json(
    new ApiResponse(200, teachersWithRatings, "Teachers fetched successfully")
  );
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  // Calculate ratings for this specific teacher
  const reviews = await TeacherReview.find({ teacherId: teacher._id });
  
  let overallRating = null;
  let reviewCount = reviews.length;

  if (reviews.length > 0) {
    const totals = { lateEntry: 0, taMarks: 0, clarity: 0, attendance: 0 };
    reviews.forEach(r => {
      totals.lateEntry += r.ratings.lateEntry;
      totals.taMarks += r.ratings.taMarks;
      totals.clarity += r.ratings.clarity;
      totals.attendance += r.ratings.attendance;
    });

    const avgRatings = {
      lateEntry: totals.lateEntry / reviews.length,
      taMarks: totals.taMarks / reviews.length,
      clarity: totals.clarity / reviews.length,
      attendance: totals.attendance / reviews.length
    };

    overallRating = Number(
      ((avgRatings.lateEntry + avgRatings.taMarks + avgRatings.clarity + avgRatings.attendance) / 4).toFixed(1)
    );
  }

  return res.json(
    new ApiResponse(200, { ...teacher.toObject(), overallRating, reviewCount }, "Teacher fetched successfully")
  );
});

/* =========================
   GET TEACHER REVIEWS (🔒)
========================= */
export const getTeacherReviews = asyncHandler(async (req, res) => {
  const teacherId = req.params.id;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  const reviews = await TeacherReview.find({ teacherId })
    .sort({ createdAt: -1 });

  let avgRatings = null;
  let overallRating = null;

  if (reviews.length > 0) {
    const totals = { lateEntry: 0, taMarks: 0, clarity: 0, attendance: 0 };
    reviews.forEach(r => {
      totals.lateEntry += r.ratings.lateEntry;
      totals.taMarks += r.ratings.taMarks;
      totals.clarity += r.ratings.clarity;
      totals.attendance += r.ratings.attendance;
    });

    avgRatings = {
      lateEntry: Number((totals.lateEntry / reviews.length).toFixed(1)),
      taMarks: Number((totals.taMarks / reviews.length).toFixed(1)),
      clarity: Number((totals.clarity / reviews.length).toFixed(1)),
      attendance: Number((totals.attendance / reviews.length).toFixed(1))
    };

    overallRating = Number(
      ((avgRatings.lateEntry + avgRatings.taMarks + avgRatings.clarity + avgRatings.attendance) / 4).toFixed(1)
    );
  }

  return res.json(
    new ApiResponse(200, { reviewsCount: reviews.length, avgRatings, overallRating, reviews }, "Teacher reviews fetched successfully")
  );
});

/* =========================
   ADD TEACHER REVIEW (🔒)
========================= */
export const addTeacherReview = asyncHandler(async (req, res) => {
  const teacherId = req.params.id;
  const userId = req.user._id;

  const { lateEntry, taMarks, clarity, attendance, textReview } = req.body;

  // ✅ Correct rating validation
  const ratings = [lateEntry, taMarks, clarity, attendance];
  if (ratings.some((r) => r < 1 || r > 5)) {
    throw new ApiError(400, "Ratings must be between 1 and 5");
  }

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  // 🚫 Prevent duplicate review
  const existingReview = await TeacherReview.findOne({
    teacherId,
    userId
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this teacher");
  }

  const review = await TeacherReview.create({
    teacherId,
    userId,
    ratings: {
      lateEntry,
      taMarks,
      clarity,
      attendance
    },
    textReview
  });

  return res.status(201).json(
    new ApiResponse(201, review, "Teacher review added successfully")
  );
});
/* =========================
   DELETE TEACHER REVIEW (🔒)
   DELETE /api/teachers/:teacherId/review/:reviewId
========================= */
export const deleteTeacherReview = asyncHandler(async (req, res) => {
  const { teacherId, reviewId } = req.params;
  const userId = req.user._id;

  // Check teacher exists
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  // Find review
  const review = await TeacherReview.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ownership check
  if (review.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this review");
  }

  await review.deleteOne();

  return res.json(
    new ApiResponse(200, null, "Teacher review deleted successfully")
  );
});