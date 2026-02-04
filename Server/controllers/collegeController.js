import College from "../models/College.js";
import OTP from "../models/OTP.js";
import Society from "../models/Society.js";
import SocietyRequest from "../models/SocietyRequest.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Helper to generate a unique college code: 3 letters + 3 digits, e.g., ABC123
const generateCollegeCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const digits = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${code}${digits}`;
};

const generateUniqueCollegeCode = async () => {
  // Try a few times to avoid collision
  for (let i = 0; i < 10; i++) {
    const candidate = generateCollegeCode();
    // eslint-disable-next-line no-await-in-loop
    const existing = await College.findOne({ uniqueCode: candidate });
    if (!existing) return candidate;
  }
  throw new Error("Failed to generate unique college code");
};

// Admin creates or updates their college profile.
// Requires a previously verified OTP for the college email.
export const upsertMyCollege = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email, address, profileImageUrl, phoneNumber, otp } = req.body;

    if (!name || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Name, email and OTP are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const recentOTP = await OTP.find({ email: normalizedEmail })
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

    // Consume OTP
    await OTP.deleteOne({ _id: recentOTP[0]._id });

    let college = await College.findOne({ admin: adminId });

    if (!college) {
      const uniqueCode = await generateUniqueCollegeCode();
      college = await College.create({
        name,
        email: normalizedEmail,
        address: address?.trim() || "",
        profileImageUrl: profileImageUrl?.trim() || "",
        phoneNumber: phoneNumber?.trim() || "",
        uniqueCode,
        admin: adminId,
        isVerified: true,
      });
      await createAuditLog({
        actorId: adminId,
        actorRole: req.user.role,
        action: "COLLEGE_CREATED",
        targetModel: "College",
        targetId: String(college._id),
        metadata: { uniqueCode },
      });
    } else {
      college.name = name;
      college.email = normalizedEmail;
      college.address = address?.trim() || "";
      college.profileImageUrl = profileImageUrl?.trim() || "";
      college.phoneNumber = phoneNumber?.trim() || "";
      college.isVerified = true;
      await college.save();

      await createAuditLog({
        actorId: adminId,
        actorRole: req.user.role,
        action: "COLLEGE_UPDATED",
        targetModel: "College",
        targetId: String(college._id),
        metadata: { uniqueCode: college.uniqueCode },
      });
    }

    return res.status(200).json({
      success: true,
      message: "College profile saved.",
      data: college,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save college profile.",
    });
  }
};

// Get the college associated with the current admin.
export const getMyCollege = async (req, res) => {
  try {
    const adminId = req.user.id;
    const college = await College.findOne({ admin: adminId });

    return res.status(200).json({
      success: true,
      data: college || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college profile.",
    });
  }
};

// Public: fetch basic college information by unique code (for society onboarding page).
export const getCollegeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "College code is required.",
      });
    }

    const college = await College.findOne({ uniqueCode: code.toUpperCase() }).select(
      "name uniqueCode",
    );

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this code.",
      });
    }

    return res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college.",
    });
  }
};

// Public: society submits a request to join a college using the unique code.
export const createSocietyRequest = async (req, res) => {
  try {
    const { name, category, logoUrl, facultyName, presidentName, email, collegeCode } = req.body;

    if (!name || !email || !collegeCode || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, category, email and college code are required.",
      });
    }

    const normalizedCode = collegeCode.toUpperCase().trim();
    const college = await College.findOne({ uniqueCode: normalizedCode });
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "Invalid college code.",
      });
    }

    const request = await SocietyRequest.create({
      name: name.trim(),
      category: category === "NON_TECH" ? "NON_TECH" : "TECH",
      logoUrl: logoUrl?.trim() || "",
      facultyName: facultyName?.trim() || "",
      presidentName: presidentName?.trim() || "",
      email: email.toLowerCase().trim(),
      college: college._id,
      collegeCode: normalizedCode,
    });

    return res.status(201).json({
      success: true,
      message: "Society request submitted. An admin will review it shortly.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit society request.",
    });
  }
};

// Admin: list pending society requests for their college.
export const getMySocietyRequests = async (req, res) => {
  try {
    const adminId = req.user.id;
    const college = await College.findOne({ admin: adminId });

    if (!college) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const requests = await SocietyRequest.find({
      college: college._id,
      status: "PENDING",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch society requests.",
    });
  }
};

// Admin: list societies under their college.
export const getMyCollegeSocieties = async (req, res) => {
  try {
    const adminId = req.user.id;
    const college = await College.findOne({ admin: adminId });

    if (!college) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const societies = await Society.find({
      college: college._id,
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: societies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college societies.",
    });
  }
};

// Admin: approve a society request → creates a Society and marks request as approved.
export const approveSocietyRequest = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;

    const college = await College.findOne({ admin: adminId });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: "Admin does not have an associated college.",
      });
    }

    const request = await SocietyRequest.findOne({
      _id: requestId,
      college: college._id,
    });

    if (!request || request.status !== "PENDING") {
      return res.status(404).json({
        success: false,
        message: "Pending request not found.",
      });
    }

    const existing = await Society.findOne({ name: request.name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A society with this name already exists.",
      });
    }

    const society = await Society.create({
      name: request.name.trim(),
      description: "",
      facultyCoordinator: adminId,
      college: college._id,
      category: request.category,
      logoUrl: request.logoUrl,
      facultyName: request.facultyName,
      presidentName: request.presidentName,
      contactEmail: request.email,
    });

    request.status = "APPROVED";
    await request.save();

    await createAuditLog({
      actorId: adminId,
      actorRole: req.user.role,
      action: "SOCIETY_REQUEST_APPROVED",
      targetModel: "Society",
      targetId: String(society._id),
      metadata: { requestId: request._id },
    });

    return res.status(200).json({
      success: true,
      message: "Society request approved.",
      data: society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve society request.",
    });
  }
};

// Admin: reject a society request.
export const rejectSocietyRequest = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;

    const college = await College.findOne({ admin: adminId });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: "Admin does not have an associated college.",
      });
    }

    const request = await SocietyRequest.findOne({
      _id: requestId,
      college: college._id,
    });

    if (!request || request.status !== "PENDING") {
      return res.status(404).json({
        success: false,
        message: "Pending request not found.",
      });
    }

    request.status = "REJECTED";
    await request.save();

    await createAuditLog({
      actorId: adminId,
      actorRole: req.user.role,
      action: "SOCIETY_REQUEST_REJECTED",
      targetModel: "SocietyRequest",
      targetId: String(request._id),
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      message: "Society request rejected.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject society request.",
    });
  }
};

