import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { generateResetToken } from "../utils/generateResetToken.js";
import crypto from "crypto";
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

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  //console.log("User found for password reset:", user);
  // ✅ Always return success (prevents email enumeration)
  if (!user) {
    return res.json(
      new ApiResponse(200, null, "If email exists, reset link sent")
    );
  }

  // 🔐 Generate token
  const { resetToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  //console.log("Reset Token:", resetToken);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>Hello ${user.name || "User"},</p>
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all;">${resetUrl}</p>
    <p><strong>This link will expire in 15 minutes.</strong></p>
    <p>If you did not request this, please ignore this email.</p>
    <br>
    <p>Thanks,<br>JIIT Reviews Team</p>
  </div>
`;
  // console.log({
  //   resetPasswordToken: user.resetPasswordToken,
  //   resetPasswordExpire: user.resetPasswordExpire
  // });
  try {
    //console.log("📧 Sending reset email to:", user.email);

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: message
    });

    return res.json(
      new ApiResponse(200, null, "Reset password link sent to email")
    );
  } catch (error) {
    // ❌ Rollback token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Email could not be sent");
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.json(
    new ApiResponse(200, null, "Password reset successful")
  );
});
