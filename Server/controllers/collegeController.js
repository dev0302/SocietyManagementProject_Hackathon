import College from "../models/College.js";
import SocietyRequest, { SOCIETY_REQUEST_STATUS } from "../models/SocietyRequest.js";
import Society from "../models/Society.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Generate a unique college code (3 letters + 3 digits)
const generateUniqueCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 3; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

// Admin: Get or create their college profile
export const getMyCollege = async (req, res) => {
  try {
    let college = await College.findOne({ admin: req.user.id });

    if (!college) {
      // Create a new college with a unique code
      let uniqueCode;
      let exists = true;
      while (exists) {
        uniqueCode = generateUniqueCode();
        exists = await College.findOne({ uniqueCode });
      }

      college = await College.create({
        name: "",
        email: req.user.email,
        admin: req.user.id,
        uniqueCode,
        isVerified: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college profile.",
    });
  }
};

// Admin: Create or update their college profile
export const upsertMyCollege = async (req, res) => {
  try {
    const { name, email, address, phoneNumber, profileImageUrl } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    let college = await College.findOne({ admin: req.user.id });
    let wasNew = false;

    if (college) {
      // Update existing college
      college.name = name.trim();
      college.email = email.toLowerCase().trim();
      if (address !== undefined) college.address = address?.trim() || "";
      if (phoneNumber !== undefined) college.phoneNumber = phoneNumber?.trim() || "";
      if (profileImageUrl !== undefined) college.profileImageUrl = profileImageUrl?.trim() || "";
      await college.save();
    } else {
      // Create new college with unique code
      wasNew = true;
      let uniqueCode;
      let exists = true;
      while (exists) {
        uniqueCode = generateUniqueCode();
        exists = await College.findOne({ uniqueCode });
      }

      college = await College.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address?.trim() || "",
        phoneNumber: phoneNumber?.trim() || "",
        profileImageUrl: profileImageUrl?.trim() || "",
        admin: req.user.id,
        uniqueCode,
        isVerified: false,
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: wasNew ? "COLLEGE_CREATED" : "COLLEGE_UPDATED",
      targetModel: "College",
      targetId: String(college._id),
      metadata: { name: college.name, uniqueCode: college.uniqueCode },
    });

    return res.status(200).json({
      success: true,
      message: wasNew ? "College profile created." : "College profile updated.",
      data: college,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A college with this email already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to save college profile.",
    });
  }
};

// Public: Get college by unique code (for society onboarding)
export const getCollegeByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid college code format.",
      });
    }

    const college = await College.findOne({ uniqueCode: code.toUpperCase() });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found with this code.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: college._id,
        name: college.name,
        email: college.email,
        address: college.address,
        uniqueCode: college.uniqueCode,
        isVerified: college.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college.",
    });
  }
};

// Create a society request to join a college (requires auth - faculty member)
export const createSocietyRequest = async (req, res) => {
  try {
    const { collegeId, collegeCode, societyId } = req.body;

    if (!collegeId && !collegeCode) {
      return res.status(400).json({
        success: false,
        message: "collegeId or collegeCode is required.",
      });
    }

    // Find college
    let college;
    if (collegeId) {
      college = await College.findById(collegeId);
    } else {
      college = await College.findOne({ uniqueCode: collegeCode.toUpperCase() });
    }

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found.",
      });
    }

    // Find the society - either from body or from user's faculty coordinator role
    let society;
    if (societyId) {
      society = await Society.findById(societyId);
      if (!society) {
        return res.status(404).json({
          success: false,
          message: "Society not found.",
        });
      }
      // Verify the user is the faculty coordinator of this society
      if (String(society.facultyCoordinator) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to request onboarding for this society.",
        });
      }
    } else {
      // Find a society where the user is the faculty coordinator
      society = await Society.findOne({ facultyCoordinator: req.user.id });
      if (!society) {
        return res.status(404).json({
          success: false,
          message: "No society found. Please create a society first.",
        });
      }
    }

    // Check if society is already associated with a college
    if (society.college) {
      return res.status(409).json({
        success: false,
        message: "This society is already associated with a college.",
      });
    }

    // Check if there's already a pending request
    const existingRequest = await SocietyRequest.findOne({
      society: society._id,
      college: college._id,
      status: SOCIETY_REQUEST_STATUS.PENDING,
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "A pending request already exists for this society and college.",
      });
    }

    // Create the request
    const request = await SocietyRequest.create({
      society: society._id,
      college: college._id,
      collegeCode: college.uniqueCode,
      requestedBy: req.user.id,
      status: SOCIETY_REQUEST_STATUS.PENDING,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_REQUEST_CREATED",
      targetModel: "SocietyRequest",
      targetId: String(request._id),
      metadata: { societyId: String(society._id), collegeId: String(college._id) },
    });

    return res.status(201).json({
      success: true,
      message: "Society request created successfully.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create society request.",
    });
  }
};

// Admin: Get all society requests for their college
export const getMySocietyRequests = async (req, res) => {
  try {
    const college = await College.findOne({ admin: req.user.id });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College profile not found. Please set up your college first.",
      });
    }

    const requests = await SocietyRequest.find({ college: college._id })
      .populate("society", "name description")
      .populate("requestedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

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

// Admin: Get all societies associated with their college
export const getMyCollegeSocieties = async (req, res) => {
  try {
    const college = await College.findOne({ admin: req.user.id });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College profile not found. Please set up your college first.",
      });
    }

    const societies = await Society.find({ college: college._id })
      .populate("facultyCoordinator", "firstName lastName email")
      .sort({ createdAt: -1 });

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

// Admin: Approve a society request
export const approveSocietyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await SocietyRequest.findById(requestId).populate("college");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Society request not found.",
      });
    }

    // Verify the admin owns this college
    if (String(request.college.admin) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to approve this request.",
      });
    }

    if (request.status !== SOCIETY_REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed.",
      });
    }

    // Update the society to associate it with the college
    await Society.findByIdAndUpdate(request.society, {
      college: request.college._id,
    });

    // Update the request status
    request.status = SOCIETY_REQUEST_STATUS.APPROVED;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_REQUEST_APPROVED",
      targetModel: "SocietyRequest",
      targetId: String(request._id),
      metadata: { societyId: String(request.society), collegeId: String(request.college._id) },
    });

    return res.status(200).json({
      success: true,
      message: "Society request approved.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to approve society request.",
    });
  }
};

// Admin: Reject a society request
export const rejectSocietyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    const request = await SocietyRequest.findById(requestId).populate("college");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Society request not found.",
      });
    }

    // Verify the admin owns this college
    if (String(request.college.admin) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to reject this request.",
      });
    }

    if (request.status !== SOCIETY_REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed.",
      });
    }

    // Update the request status
    request.status = SOCIETY_REQUEST_STATUS.REJECTED;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    if (rejectionReason) {
      request.rejectionReason = rejectionReason.trim();
    }
    await request.save();

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_REQUEST_REJECTED",
      targetModel: "SocietyRequest",
      targetId: String(request._id),
      metadata: { societyId: String(request.society), collegeId: String(request.college._id) },
    });

    return res.status(200).json({
      success: true,
      message: "Society request rejected.",
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reject society request.",
    });
  }
};
