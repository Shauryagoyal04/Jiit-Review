import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@mail\.jiit\.ac\.in$/,
        "Only JIIT student emails are allowed"
      ]
    },

    password: {
      type: String,
      required: true
    },

    campus: {
      type: String,
      enum: ["62", "128"],
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String
    },

    otpExpiry: {
      type: Date
    },

  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

