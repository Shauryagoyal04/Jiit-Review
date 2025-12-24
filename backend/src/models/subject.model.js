import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    department: {
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

export const Subject = mongoose.model("Subject", subjectSchema);
