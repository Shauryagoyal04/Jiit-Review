import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    campus: {
      type: String,
      enum: ["62", "128", "both"],
      required: true
    }
  },
  { timestamps: true }
);

subjectSchema.index(
  { name: 1, type: 1, semester: 1 },
  { unique: true }
);
export const Subject = mongoose.model("Subject", subjectSchema);
