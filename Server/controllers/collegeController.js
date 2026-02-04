import College from "../models/College.js";
import Event from "../models/Event.js";
import OTP from "../models/OTP.js";
import Society from "../models/Society.js";
import SocietyRequest from "../models/SocietyRequest.js";
import SocietyInviteLink from "../models/SocietyInviteLink.js";
import User from "../models/User.js";
import { ROLES } from "../config/roles.js";
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
    const { name, category, logoUrl, facultyName, presidentName, email, facultyEmail, collegeCode } = req.body;

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
      facultyEmail: facultyEmail?.toLowerCase().trim() || "",
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

// Helper for date range filters
const getEventsDateRange = (filter) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const endOfTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000 - 1);
  switch (filter) {
    case "today":
      return { $gte: startOfToday, $lte: endOfToday };
    case "yesterday":
      return { $gte: startOfYesterday, $lt: startOfToday };
    case "tomorrow":
      return { $gte: startOfTomorrow, $lte: endOfTomorrow };
    case "upcoming":
      return { $gt: endOfToday };
    case "past":
      return { $lt: startOfToday };
    default:
      return null;
  }
};

// Admin: get all events from college societies
// Query: filter=upcoming|today|yesterday|tomorrow|past, category=TECH|NON_TECH
export const getCollegeEvents = async (req, res) => {
  try {
    const adminId = req.user.id;
    const college = await College.findOne({ admin: adminId });
    if (!college) {
      return res.status(200).json({ success: true, data: [] });
    }

    const societies = await Society.find({
      college: college._id,
      isActive: true,
    }).select("_id category");

    const societyIds = societies.map((s) => s._id);
    if (societyIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { filter, category } = req.query;
    const match = { society: { $in: societyIds } };

    const dateRange = filter ? getEventsDateRange(filter) : null;
    if (dateRange) {
      match.date = dateRange;
    }

    let filteredSocietyIds = societyIds;
    if (category && ["TECH", "NON_TECH"].includes(category)) {
      filteredSocietyIds = societies.filter((s) => s.category === category).map((s) => s._id);
      if (filteredSocietyIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      match.society = { $in: filteredSocietyIds };
    }

    const events = await Event.find(match)
      .populate("society", "name category logoUrl")
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch college events.",
    });
  }
};

// Faculty: get the college to which their societies belong
export const getFacultyCollege = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const society = await Society.findOne({
      facultyCoordinator: facultyId,
      isActive: true,
    })
      .populate("college")
      .lean();
    if (!society?.college) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({
      success: true,
      data: society.college,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty college.",
    });
  }
};

// Faculty: list societies where they are faculty coordinator
export const getFacultySocieties = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const societies = await Society.find({
      facultyCoordinator: facultyId,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: societies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty societies.",
    });
  }
};

// Faculty: get events for their societies
export const getFacultyEvents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const societies = await Society.find({
      facultyCoordinator: facultyId,
      isActive: true,
    }).select("_id category");

    const societyIds = societies.map((s) => s._id);
    if (societyIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { filter, category } = req.query;
    const match = { society: { $in: societyIds } };

    const dateRange = filter ? getEventsDateRange(filter) : null;
    if (dateRange) {
      match.date = dateRange;
    }

    let filteredSocietyIds = societyIds;
    if (category && ["TECH", "NON_TECH"].includes(category)) {
      filteredSocietyIds = societies.filter((s) => s.category === category).map((s) => s._id);
      if (filteredSocietyIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      match.society = { $in: filteredSocietyIds };
    }

    const events = await Event.find(match)
      .populate("society", "name category logoUrl")
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty events.",
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

    let facultyCoordinatorId = adminId;
    if (request.facultyEmail) {
      const facultyUser = await User.findOne({
        email: request.facultyEmail.toLowerCase(),
        role: ROLES.FACULTY,
      });
      if (facultyUser) {
        facultyCoordinatorId = facultyUser._id;
      }
    }

    const society = await Society.create({
      name: request.name.trim(),
      description: "",
      facultyCoordinator: facultyCoordinatorId,
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

// Admin: delete (deactivate) a society under their college
export const deleteSociety = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { societyId } = req.params;

    const college = await College.findOne({ admin: adminId });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: "Admin does not have an associated college.",
      });
    }

    const society = await Society.findOne({
      _id: societyId,
      college: college._id,
    });

    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found or does not belong to your college.",
      });
    }

    society.isActive = false;
    await society.save();

    await createAuditLog({
      actorId: adminId,
      actorRole: req.user.role,
      action: "SOCIETY_DELETED",
      targetModel: "Society",
      targetId: String(society._id),
      metadata: { name: society.name },
    });

    return res.status(200).json({
      success: true,
      message: "Society deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete society.",
    });
  }
};

// ----- Society invite link (admin creates link with faculty head email) -----

// Admin: create society invite link with faculty head email
export const createSocietyInviteLink = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { facultyHeadEmail } = req.body;

    if (!facultyHeadEmail || !String(facultyHeadEmail).trim()) {
      return res.status(400).json({
        success: false,
        message: "Faculty head email is required.",
      });
    }

    const college = await College.findOne({ admin: adminId });
    if (!college) {
      return res.status(400).json({
        success: false,
        message: "Admin does not have an associated college.",
      });
    }

    const email = String(facultyHeadEmail).trim().toLowerCase();
    const token = `sil-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const invite = await SocietyInviteLink.create({
      college: college._id,
      facultyHeadEmail: email,
      token,
      expiresAt,
      createdBy: adminId,
    });

    const baseUrl =
      process.env.CLIENT_URL || (req.get("origin") || "http://localhost:5173").replace(/\/$/, "");
    const link = `${baseUrl}/society/onboard?token=${encodeURIComponent(invite.token)}`;

    await createAuditLog({
      actorId: adminId,
      actorRole: req.user.role,
      action: "SOCIETY_INVITE_LINK_CREATED",
      targetModel: "SocietyInviteLink",
      targetId: String(invite._id),
      metadata: { facultyHeadEmail: email },
    });

    return res.status(201).json({
      success: true,
      message: "Society invite link created.",
      data: { link, token: invite.token, facultyHeadEmail: email, expiresAt: invite.expiresAt },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create society invite link.",
    });
  }
};

// Public: get society invite by token (for onboarding page)
export const getSocietyInviteByToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required.",
      });
    }

    const invite = await SocietyInviteLink.findOne({ token })
      .populate("college", "name uniqueCode")
      .lean();

    if (!invite || invite.used) {
      return res.status(404).json({
        success: false,
        message: "Invite not found or already used.",
      });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invite has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        facultyHeadEmail: invite.facultyHeadEmail,
        collegeName: invite.college?.name,
        collegeCode: invite.college?.uniqueCode,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invite.",
    });
  }
};

// Authenticated: create society from invite (user must match facultyHeadEmail)
export const createSocietyFromInvite = async (req, res) => {
  try {
    const { token, name, description, category, logoUrl, facultyName, presidentName, contactEmail } =
      req.body;

    if (!token || !name) {
      return res.status(400).json({
        success: false,
        message: "Token and society name are required.",
      });
    }

    const invite = await SocietyInviteLink.findOne({ token }).populate("college");
    if (!invite || invite.used) {
      return res.status(400).json({
        success: false,
        message: "Invite not found or already used.",
      });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invite has expired.",
      });
    }
    if (invite.facultyHeadEmail !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "This link is for a different email. Please log in with the faculty head email.",
      });
    }

    const existing = await Society.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A society with this name already exists.",
      });
    }

    let userId = req.user.id;
    const user = await User.findById(userId);
    if (user.role !== ROLES.FACULTY) {
      user.role = ROLES.FACULTY;
      await user.save();
    }

    const society = await Society.create({
      name: name.trim(),
      description: description?.trim() || "",
      facultyCoordinator: userId,
      college: invite.college._id,
      category: category === "NON_TECH" ? "NON_TECH" : "TECH",
      logoUrl: logoUrl?.trim() || "",
      facultyName: facultyName?.trim() || "",
      presidentName: presidentName?.trim() || "",
      contactEmail: contactEmail?.toLowerCase().trim() || req.user.email,
    });

    invite.used = true;
    invite.usedAt = new Date();
    invite.society = society._id;
    await invite.save();

    await createAuditLog({
      actorId: userId,
      actorRole: req.user.role,
      action: "SOCIETY_CREATED_FROM_INVITE",
      targetModel: "Society",
      targetId: String(society._id),
      metadata: { inviteId: invite._id },
    });

    return res.status(201).json({
      success: true,
      message: "Society created successfully. You are the faculty head.",
      data: society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create society from invite.",
    });
  }
};

// Faculty: get all societies in the same college (for viewing others; read-only)
export const getFacultyAllSocieties = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const mySociety = await Society.findOne({
      facultyCoordinator: facultyId,
      isActive: true,
    }).select("college");
    if (!mySociety?.college) {
      return res.status(200).json({ success: true, data: [] });
    }
    const societies = await Society.find({
      college: mySociety.college,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, data: societies });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch societies.",
    });
  }
};

// Faculty: get all events from college (my societies + other societies) for viewing
export const getFacultyAllEvents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const mySocieties = await Society.find({
      facultyCoordinator: facultyId,
      isActive: true,
    }).select("_id category college");
    if (mySocieties.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    const collegeId = mySocieties[0].college;
    if (!collegeId) {
      return res.status(200).json({ success: true, data: [] });
    }
    const allSocietyIds = await Society.find({ college: collegeId, isActive: true })
      .select("_id category")
      .lean();
    let ids = allSocietyIds.map((s) => s._id);
    const { filter, category } = req.query;
    if (category && ["TECH", "NON_TECH"].includes(category)) {
      ids = allSocietyIds.filter((s) => s.category === category).map((s) => s._id);
      if (ids.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
    }
    const match = { society: { $in: ids } };
    const dateRange = filter ? getEventsDateRange(filter) : null;
    if (dateRange) match.date = dateRange;
    const events = await Event.find(match)
      .populate("society", "name category logoUrl")
      .sort({ date: 1 })
      .lean();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
    });
  }
};

