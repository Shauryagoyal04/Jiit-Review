import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

/* =========================
   REGISTER
========================= */
export const register = asyncHandler(async (req, res) => {
  const { email, password, campus } = req.body;

  if (!email || !password || !campus) {
    throw new ApiError(400, "All fields are required");
  }

  // Email domain check
  if (!email.endsWith("@mail.jiit.ac.in")) {
    throw new ApiError(400, "Only JIIT student emails are allowed");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    email,
    password: hashedPassword,
    campus,
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    isVerified: false
  });

  // TODO: send OTP via email (nodemailer later)
  // console.log("OTP:", otp);

    // Send OTP email
    await sendEmail({
        to: email,
        subject: "Verify your JIIT Reviews account",
        html: `
        <div style="font-family: Arial, sans-serif;">
            <h2>JIIT Reviews – Email Verification</h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="letter-spacing: 2px;">${otp}</h1>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn’t request this, please ignore this email.</p>
        </div>
        `
    });

  return res
    .status(201)
    .json(new ApiResponse(201, null, "OTP sent to your email"));
});

/* =========================
   VERIFY OTP
========================= */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User already verified");
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return res.json(
    new ApiResponse(200, null, "Email verified successfully")
  );
});

/* =========================
   LOGIN
========================= */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email first");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      campus: user.campus
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json(
    new ApiResponse(200, { token }, "Login successful")
  );
});

// LOGOUT (optional, for client-side token handling)
export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, null, "Logged out successfully")
  );
});
/// =========================
// GET ME (🔒)
// =========================
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus,
        role: user.role,
        isVerified: user.isVerified
      },
      "User fetched successfully"
    )
  );
});
