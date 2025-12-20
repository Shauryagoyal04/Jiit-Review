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
      required: true
    },

    campus: {
      type: String,
      enum: ["62", "128"],
      required: true
    }
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", teacherSchema);
