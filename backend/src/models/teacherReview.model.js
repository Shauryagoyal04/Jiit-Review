import mongoose from "mongoose";

const teacherReviewSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    ratings: {
      lateEntry: { type: Number, min: 1, max: 5, required: true },
      taMarks: { type: Number, min: 1, max: 5, required: true },
      clarity: { type: Number, min: 1, max: 5, required: true },
      attendance: { type: Number, min: 1, max: 5, required: true }
    },

    textReview: {
      type: String,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

// One review per user per teacher
teacherReviewSchema.index(
  { teacherId: 1, userId: 1 },
  { unique: true }
);

export const TeacherReview = mongoose.model("TeacherReview", teacherReviewSchema);
