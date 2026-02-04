import Invite from "../models/Invite.js";
import Membership from "../models/Membership.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

const LINK_PLACEHOLDER_SUFFIX = "@invite-link.placeholder";

// Head lists students who have joined as members in their department.
export const listDepartmentMembers = async (req, res) => {
  try {
    const headMembership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
      role: ROLES.HEAD,
    });
    if (!headMembership || !headMembership.department) {
      return res.status(400).json({
        success: false,
        message: "You must be a Head of a department to view members.",
      });
    }

    const memberships = await Membership.find({
      department: headMembership.department,
      isActive: true,
    })
      .populate("student", "firstName lastName email")
      .sort({ createdAt: 1 })
      .lean();

    const data = memberships.map((m) => ({
      _id: m._id,
      role: m.role,
      student: m.student
        ? {
            id: m.student._id,
            firstName: m.student.firstName,
            lastName: m.student.lastName,
            email: m.student.email,
          }
        : null,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load department members.",
    });
  }
};

// Head creates member-invite link for their department (no departmentId in body).
export const createMemberInviteLink = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
      role: ROLES.HEAD,
    });
    if (!membership || !membership.department) {
      return res.status(400).json({
        success: false,
        message: "You must be a Head of a department to add members.",
      });
    }

    const token = `member-${membership.department}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const invite = await Invite.create({
      email: `link-${token}${LINK_PLACEHOLDER_SUFFIX}`,
      society: membership.society,
      department: membership.department,
      role: ROLES.MEMBER,
      token,
      expiresAt,
      createdBy: req.user.id,
    });
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "MEMBER_INVITE_LINK_CREATED",
      targetModel: "Invite",
      targetId: String(invite._id),
      metadata: { departmentId: String(membership.department) },
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

// Head creates member invite by email for their department.
export const createMemberInviteByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const membership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
      role: ROLES.HEAD,
    });
    if (!membership || !membership.department) {
      return res.status(400).json({
        success: false,
        message: "You must be a Head of a department to add members.",
      });
    }

    const token = `member-${membership.department}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await Invite.create({
      email: email.toLowerCase().trim(),
      society: membership.society,
      department: membership.department,
      role: ROLES.MEMBER,
      token,
      expiresAt,
      createdBy: req.user.id,
    });
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "MEMBER_INVITE_EMAIL_CREATED",
      targetModel: "Invite",
      targetId: String(invite._id),
      metadata: { departmentId: String(membership.department), email: invite.email },
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
