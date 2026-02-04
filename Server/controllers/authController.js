import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PlatformConfig from "../models/PlatformConfig.js";
import OTP from "../models/OTP.js";
import Invite from "../models/Invite.js";
import Membership from "../models/Membership.js";
import Department from "../models/Department.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

const LINK_PLACEHOLDER_SUFFIX = "@invite-link.placeholder";

// Helper: issues JWT in a consistent way
const issueToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });
};

// Phase 1 – Admin access based on pre-approved config.
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields including OTP are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Verify OTP
    const recentOTP = await OTP.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOTP.length || recentOTP[0].otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (recentOTP[0].expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const config = await PlatformConfig.findOne();
    const allowedAdmins = config?.adminEmails || [];
    const isAllowed = allowedAdmins.includes(email.trim().toLowerCase());

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Email is not approved for admin access.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: recentOTP[0]._id });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: ROLES.ADMIN,
    });

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "ADMIN_REGISTERED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: { email },
    });

    const token = issueToken(user);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while registering admin.",
    });
  }
};

// Faculty signup – only if email is pre-approved in PlatformConfig.facultyWhitelist
export const registerFaculty = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields including OTP are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Verify OTP
    const recentOTP = await OTP.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOTP.length || recentOTP[0].otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (recentOTP[0].expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const config = await PlatformConfig.findOne();
    const allowedFaculty = (config?.facultyWhitelist || []).map((e) => String(e).trim().toLowerCase());
    const normalizedEmail = email.trim().toLowerCase();
    const isAllowed = allowedFaculty.includes(normalizedEmail);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Email is not approved for faculty sign up.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: recentOTP[0]._id });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: ROLES.FACULTY,
    });

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "FACULTY_REGISTERED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: { email },
    });

    const token = issueToken(user);

    return res.status(201).json({
      success: true,
      message: "Faculty registered successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while registering faculty.",
    });
  }
};

// Generic student signup – starts with STUDENT role.
export const registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, otp, role } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields including OTP are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Verify OTP
    const recentOTP = await OTP.find({ email: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOTP.length || recentOTP[0].otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (recentOTP[0].expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: recentOTP[0]._id });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Allow student sub-roles to be set at signup (CORE/HEAD/MEMBER).
    // If not provided, default to STUDENT for backward compatibility.
    const allowedStudentRoles = new Set([
      ROLES.STUDENT,
      ROLES.CORE,
      ROLES.HEAD,
      ROLES.MEMBER,
    ]);

    const normalizedRole =
      typeof role === "string" ? role.trim().toUpperCase() : ROLES.STUDENT;

    const finalRole = allowedStudentRoles.has(normalizedRole)
      ? normalizedRole
      : ROLES.STUDENT;

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "STUDENT_REGISTERED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: { email },
    });

    const token = issueToken(user);

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while registering student.",
    });
  }
};

// Public: get invite details by token (for signup form display).
export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required.",
      });
    }
    const invite = await Invite.findOne({ token })
      .populate("department", "name")
      .populate("society", "name")
      .lean();
    if (!invite || invite.used) {
      return res.status(404).json({
        success: false,
        message: "Invite is invalid or already used.",
      });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invite has expired.",
      });
    }
    const isLinkInvite =
      invite.email && invite.email.endsWith(LINK_PLACEHOLDER_SUFFIX);
    return res.status(200).json({
      success: true,
      data: {
        role: invite.role,
        departmentName: invite.department?.name || "Department",
        societyName: invite.society?.name || "Society",
        email: isLinkInvite ? null : invite.email,
        isLinkInvite,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load invite details.",
    });
  }
};

// Sign up with invite token: create account (no OTP) and enroll as head/member.
export const signupWithInvite = async (req, res) => {
  try {
    const { token, email, password, confirmPassword, firstName, lastName } =
      req.body;

    if (!token || !email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message:
          "Token, email, password, confirm password, first name and last name are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const invite = await Invite.findOne({ token });
    if (!invite || invite.used) {
      return res.status(400).json({
        success: false,
        message: "Invite is invalid or already used.",
      });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invite has expired.",
      });
    }

    const isLinkInvite =
      invite.email && invite.email.endsWith(LINK_PLACEHOLDER_SUFFIX);
    const normalizedEmail = email.trim().toLowerCase();
    if (!isLinkInvite && invite.email.toLowerCase() !== normalizedEmail) {
      return res.status(403).json({
        success: false,
        message: "This invite was sent to a different email address.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in and accept the invite from your dashboard.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole =
      invite.role === ROLES.HEAD || invite.role === ROLES.CORE
        ? invite.role
        : ROLES.STUDENT;
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    const existingMembership = await Membership.findOne({
      student: user._id,
      isActive: true,
    });
    if (existingMembership) {
      existingMembership.isActive = false;
      existingMembership.endedAt = new Date();
      await existingMembership.save();
    }

    const membership = await Membership.create({
      student: user._id,
      society: invite.society,
      department: invite.department || null,
      role: invite.role,
    });

    invite.used = true;
    invite.usedAt = new Date();
    await invite.save();

    if (invite.role === ROLES.HEAD && invite.department) {
      await Department.findByIdAndUpdate(invite.department, {
        head: user._id,
      });
    }

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "INVITE_ACCEPTED",
      targetModel: "Membership",
      targetId: String(membership._id),
      metadata: { inviteId: invite._id },
    });

    const jwtToken = issueToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created and you have been enrolled as Head of the department.",
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to sign up with invite.",
    });
  }
};

// Login – common for all roles.
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Optional: if role is provided by client, ensure it matches.
    if (role) {
      const normalizedRole = typeof role === "string" ? role.trim().toUpperCase() : "";
      if (normalizedRole && normalizedRole !== user.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }
    }

    const token = issueToken(user);

    const cookieOptions = {
      httpOnly: true,
      secure: false, // adjust when adding HTTPS
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "USER_LOGIN",
      targetModel: "User",
      targetId: String(user._id),
      metadata: { email },
    });

    return res
      .cookie("Token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Logged in successfully.",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl || "",
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while logging in.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "PASSWORD_CHANGED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating password.",
    });
  }
};

// Logout – clear auth cookie on the server.
export const logout = async (req, res) => {
  try {
    res.clearCookie("Token", {
      httpOnly: true,
      secure: false, // keep in sync with login cookie options
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while logging out.",
    });
  }
};

