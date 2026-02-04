import Society from "../models/Society.js";
import Department from "../models/Department.js";
import Invite from "../models/Invite.js";
import Membership from "../models/Membership.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Phase 1 – Faculty creates a society and becomes the coordinator (FACULTY).

export const createSociety = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const existing = await Society.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Society with this name already exists.",
      });
    }

    const society = await Society.create({
      name: name.trim(),
      description: description?.trim() || "",
      facultyCoordinator: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_CREATED",
      targetModel: "Society",
      targetId: String(society._id),
      metadata: { name: society.name },
    });

    return res.status(201).json({
      success: true,
      message: "Society created successfully.",
      data: society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create society.",
    });
  }
};

// Faculty updates their society (only if they are faculty coordinator)
export const updateSociety = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { name, description, logoUrl, category, facultyName, presidentName, contactEmail } = req.body;

    const society = await Society.findById(societyId);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: "Society not found.",
      });
    }

    if (String(society.facultyCoordinator) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this society.",
      });
    }

    if (name !== undefined) society.name = name.trim();
    if (description !== undefined) society.description = description?.trim() || "";
    if (logoUrl !== undefined) society.logoUrl = logoUrl?.trim() || "";
    if (category !== undefined && ["TECH", "NON_TECH"].includes(category)) society.category = category;
    if (facultyName !== undefined) society.facultyName = facultyName?.trim() || "";
    if (presidentName !== undefined) society.presidentName = presidentName?.trim() || "";
    if (contactEmail !== undefined) society.contactEmail = contactEmail?.toLowerCase().trim() || "";

    await society.save();

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_UPDATED",
      targetModel: "Society",
      targetId: String(society._id),
      metadata: {},
    });

    return res.status(200).json({
      success: true,
      message: "Society updated successfully.",
      data: society,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update society.",
    });
  }
};

// Core creates departments (societyId optional: use from membership or create society).
export const createDepartment = async (req, res) => {
  try {
    const { societyId, name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    let society = null;
    if (societyId) {
      society = await Society.findById(societyId);
      if (!society) {
        return res.status(404).json({ success: false, message: "Society not found." });
      }
    }
    if (!society) {
      const membership = await Membership.findOne({ student: req.user.id, isActive: true });
      if (membership) {
        society = await Society.findById(membership.society);
      }
    }
    if (!society) {
      society = await Society.findOne({ facultyCoordinator: req.user.id });
      if (!society) {
        society = await Society.create({
          name: `Society ${req.user.id}`.trim(),
          description: "Created by core member",
          facultyCoordinator: req.user.id,
        });
        await Membership.create({
          student: req.user.id,
          society: society._id,
          role: ROLES.CORE,
        });
      }
    }

    const department = await Department.create({
      society: society._id,
      name: name.trim(),
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "DEPARTMENT_CREATED",
      targetModel: "Department",
      targetId: String(department._id),
      metadata: { societyId: String(society._id) },
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create department.",
    });
  }
};

// Faculty / Core / Head create invites for internal roles.

export const createInvite = async (req, res) => {
  try {
    const { email, societyId, departmentId, role, expiresAt } = req.body;

    if (!email || !societyId || !role || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "email, societyId, role, and expiresAt are required.",
      });
    }

    if (![ROLES.CORE, ROLES.HEAD, ROLES.MEMBER].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invite role.",
      });
    }

    const token = `${societyId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const invite = await Invite.create({
      email: email.toLowerCase(),
      society: societyId,
      department: departmentId || null,
      role,
      token,
      expiresAt: new Date(expiresAt),
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "INVITE_CREATED",
      targetModel: "Invite",
      targetId: String(invite._id),
      metadata: { email, role },
    });

    return res.status(201).json({
      success: true,
      message: "Invite created successfully.",
      data: {
        inviteId: invite._id,
        token: invite.token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create invite.",
    });
  }
};

// Student accepts invite → creates/upgrades membership.

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invite token is required.",
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

    const isLinkInvite = invite.email && invite.email.endsWith("@invite-link.placeholder");
    const emailMatches = invite.email === req.user.email.toLowerCase();
    if (!isLinkInvite && !emailMatches) {
      return res.status(403).json({
        success: false,
        message: "Invite does not belong to this user.",
      });
    }

    // One active membership per student – if one exists, mark it inactive.
    const existingMembership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
    });

    if (existingMembership) {
      existingMembership.isActive = false;
      existingMembership.endedAt = new Date();
      await existingMembership.save();
    }

    const membership = await Membership.create({
      student: req.user.id,
      society: invite.society,
      department: invite.department || null,
      role: invite.role,
    });

    invite.used = true;
    invite.usedAt = new Date();
    await invite.save();

    if (invite.role === ROLES.HEAD && invite.department) {
      await Department.findByIdAndUpdate(invite.department, { head: req.user.id });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "INVITE_ACCEPTED",
      targetModel: "Membership",
      targetId: String(membership._id),
      metadata: { inviteId: invite._id },
    });

    return res.status(200).json({
      success: true,
      message: "Invite accepted. Membership updated.",
      data: membership,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept invite.",
    });
  }
};

