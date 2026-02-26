import Department from "../models/Department.js";
import Invite from "../models/Invite.js";
import Membership from "../models/Membership.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

const LINK_PLACEHOLDER_SUFFIX = "@invite-link.placeholder";

// Shared helper: get departments list for the current core user.
async function getDepartmentsForUser(userId) {
  const membership = await Membership.findOne({ student: userId, isActive: true });
  const byCreatedBy = await Department.find({ createdBy: userId })
    .populate("head", "firstName lastName email")
    .sort({ createdAt: -1 })
    .lean();
  if (membership) {
    const bySociety = await Department.find({ society: membership.society })
      .populate("head", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();
    const seen = new Set(bySociety.map((d) => String(d._id)));
    byCreatedBy.forEach((d) => {
      if (!seen.has(String(d._id))) bySociety.push(d);
    });
    return bySociety;
  }
  return byCreatedBy;
}

// List departments for the current core user (from their society/societies).
// Returns real DB data with head populated and membersCount.
export const listDepartments = async (req, res) => {
  try {
    const departments = await getDepartmentsForUser(req.user.id);
    const departmentIds = departments.map((d) => d._id);
    const counts = await Membership.aggregate([
      { $match: { department: { $in: departmentIds }, isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [String(c._id), c.count])
    );
    const data = departments.map((d) => ({
      ...d,
      membersCount: countMap[String(d._id)] ?? 0,
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load departments.",
    });
  }
};

// Create head-invite link for a department (whoever uses the link becomes HEAD).
export const createHeadInviteLink = async (req, res) => {
  try {
    const { departmentId } = req.body;
    if (!departmentId) {
      return res.status(400).json({ success: false, message: "departmentId is required." });
    }
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    const token = `head-${departmentId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const invite = await Invite.create({
      email: `link-${token}${LINK_PLACEHOLDER_SUFFIX}`,
      society: department.society,
      department: department._id,
      role: ROLES.HEAD,
      token,
      expiresAt,
      createdBy: req.user.id,
    });
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "HEAD_INVITE_LINK_CREATED",
      targetModel: "Invite",
      targetId: String(invite._id),
      metadata: { departmentId },
    });
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}`;
    return res.status(201).json({
      success: true,
      data: { link, token, expiresAt },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create invite link.",
    });
  }
};

// Create head invite by email for a department.
export const createHeadInviteByEmail = async (req, res) => {
  try {
    const { departmentId, email } = req.body;
    if (!departmentId || !email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "departmentId and email are required.",
      });
    }
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    const token = `head-${departmentId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await Invite.create({
      email: email.toLowerCase().trim(),
      society: department.society,
      department: department._id,
      role: ROLES.HEAD,
      token,
      expiresAt,
      createdBy: req.user.id,
    });
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "HEAD_INVITE_EMAIL_CREATED",
      targetModel: "Invite",
      targetId: String(invite._id),
      metadata: { departmentId, email: invite.email },
    });
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}`;
    return res.status(201).json({
      success: true,
      message: "Invite created. Share the link with the user.",
      data: { link, token, expiresAt },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create invite.",
    });
  }
};

// These endpoints are intentionally lightweight and mostly for logging/demo purposes.

export const handleMemberDecision = async (req, res) => {
  try {
    const { name, email, decision } = req.body;

    if (!name || !email || !decision) {
      return res.status(400).json({
        success: false,
        message: "name, email, and decision are required.",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: decision === "APPROVE" ? "CORE_MEMBER_APPROVED" : "CORE_MEMBER_REJECTED",
      targetModel: "User",
      targetId: email,
      metadata: { name, email },
    });

    return res.status(200).json({
      success: true,
      message: `Member request ${decision.toLowerCase()}d.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process member decision.",
    });
  }
};

export const handleMemberRoleChange = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, and role are required.",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "CORE_MEMBER_ROLE_CHANGED",
      targetModel: "User",
      targetId: email,
      metadata: { name, email, role },
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update member role.",
    });
  }
};

// Get the society the current core user belongs to (from their active membership).
export const getMySociety = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
    })
      .populate("society", "name category logoUrl _id")
      .lean();

    if (!membership?.society) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
      success: true,
      data: membership.society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch society.",
    });
  }
};

// Same as listDepartments: returns real departments and heads for the core user.
export const getDepartmentsSummary = async (req, res) => {
  try {
    const departments = await getDepartmentsForUser(req.user.id);
    const departmentIds = departments.map((d) => d._id);
    const counts = await Membership.aggregate([
      { $match: { department: { $in: departmentIds }, isActive: true } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [String(c._id), c.count])
    );
    const data = departments.map((d) => ({
      ...d,
      membersCount: countMap[String(d._id)] ?? 0,
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load departments.",
    });
  }
};

// List heads assigned by the current core user (department + head).
// "Added by core" is interpreted as departments created by this core user.
export const listMyDepartmentHeads = async (req, res) => {
  try {
    const departments = await Department.find({
      createdBy: req.user.id,
      head: { $ne: null },
      isActive: true,
    })
      .populate("head", "firstName lastName email avatarUrl")
      .populate("society", "name")
      .sort({ createdAt: -1 })
      .lean();

    const data = departments.map((d) => ({
      department: { id: d._id, name: d.name },
      society: d.society ? { id: d.society._id, name: d.society.name } : null,
      head: d.head
        ? {
            id: d.head._id,
            firstName: d.head.firstName,
            lastName: d.head.lastName,
            email: d.head.email,
            avatarUrl: d.head.avatarUrl || "",
          }
        : null,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load department heads.",
    });
  }
};

