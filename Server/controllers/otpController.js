import otpGenerator from "otp-generator";
import OTP from "../models/OTP.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import { emailVerificationTemplate } from "../mail/templates/emailVerificationTemplate.js";

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Signup guard: do not send OTP if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).select("_id");
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please log in instead.",
      });
    }

    // Generate OTP
    let otp;
    let otpBody;

    // Ensure unique index on otp field
    await OTP.collection.createIndex({ otp: 1 }, { unique: true });

    // Generate + insert until unique
    while (true) {
      try {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });

        otpBody = await OTP.create({
          email: email.toLowerCase(),
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        break;
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate OTP → retry
          continue;
        }
        throw err;
      }
    }

    // Send email
    try {
      await mailSender(
        email,
        "Email Verification - Cozen Societies",
        emailVerificationTemplate(otp)
      );
    } catch (emailError) {
      // eslint-disable-next-line no-console
      console.error("Failed to send email:", emailError);
      // Still return success, OTP is saved
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // Find most recent OTP for this email
    const recentOTP = await OTP.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOTP.length) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    const otpRecord = recentOTP[0];

    // Check if OTP matches
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Mark OTP as used (optional - delete it)
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
};
