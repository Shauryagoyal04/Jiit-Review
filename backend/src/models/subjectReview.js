import mongoose from "mongoose";

const subjectReviewSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    campus: {
      type: String,
      enum: ["62", "128", "both"],
      required: true
    },

    ratings: {
      difficulty: { type: Number, min: 1, max: 5, required: true },
      content: { type: Number, min: 1, max: 5, required: true },
      examPattern: { type: Number, min: 1, max: 5, required: true },
      relativeMarks: { type: Number, min: 1, max: 5, required: true }
    },

    textReview: {
      type: String,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

// One review per user per subject
subjectReviewSchema.index(
  { subjectId: 1, userId: 1 },
  { unique: true }
);

export const SubjectReview = mongoose.model("SubjectReview", subjectReviewSchema);