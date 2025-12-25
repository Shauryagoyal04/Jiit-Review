import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
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

    designation: {
      type: String,
      required: true,
      trim: true
    },

    highestQualification: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate teachers
teacherSchema.index(
  { name: 1, department: 1 },
  { unique: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
