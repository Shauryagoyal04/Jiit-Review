import nodemailer from "nodemailer";
import ApiError from "./ApiError.js";

const sendEmail = async ({ to, subject, html }) => {
  try {
    //console.log("📨 sendEmail called");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"JIIT Reviews" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    throw new ApiError(500, "Email could not be sent");
  }
};

export default sendEmail;
