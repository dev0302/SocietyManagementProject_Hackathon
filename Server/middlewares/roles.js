import { ROLES } from "../config/roles.js";
import PlatformConfig from "../models/PlatformConfig.js";
import University from "../models/University.js";
import College from "../models/College.js";

// Authorization helpers: what you are allowed to do.

export const requireRoles = (allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while checking role.",
    });
  }
};

export const isAdmin = requireRoles([ROLES.ADMIN]);

// Platform admin: listed in PlatformConfig.adminEmails (and typically role ADMIN)
export const isPlatformAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const config = await PlatformConfig.findOne();
    const adminEmails = config?.adminEmails || [];
    const isPlatform = adminEmails.includes(req.user.email?.toLowerCase());
    if (!isPlatform && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, message: "Platform admin only." });
    }
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error checking platform admin." });
  }
};

// University admin: req.params.universityId or req.body.universityId, and user in University.adminEmails
export const isUniversityAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const universityId = req.params.universityId || req.params.university_id || req.body?.universityId;
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID required." });
    }
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }
    const emails = (university.adminEmails || []).map((e) => e?.toLowerCase());
    if (!emails.includes(req.user.email?.toLowerCase())) {
      return res.status(403).json({ success: false, message: "Not an admin for this university." });
    }
    req.university = university;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error checking university admin." });
  }
};

// College admin: college where admin=user.id OR user.email in accessControl.adminEmails. Sets req.college.
export const isCollegeAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const college = await College.findOne({
      $or: [
        { admin: req.user.id },
        { "accessControl.adminEmails": req.user.email?.toLowerCase() },
      ],
    });
    if (!college) {
      return res.status(403).json({ success: false, message: "No college admin access." });
    }
    req.college = college;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error checking college admin." });
  }
};

// Optionally attach req.college when user is college admin (by ID or email). Does not 403.
export const attachCollegeIfAny = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const College = (await import("../models/College.js")).default;
    const college = await College.findOne({
      $or: [
        { admin: req.user.id },
        { "accessControl.adminEmails": req.user.email?.toLowerCase() },
      ],
    });
    req.college = college || null;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, message: "Error resolving college." });
  }
};

export const isFaculty = requireRoles([ROLES.FACULTY]);
export const isCore = requireRoles([ROLES.CORE]);
export const isHead = requireRoles([ROLES.HEAD]);
export const isMember = requireRoles([ROLES.MEMBER]);
export const isFacultyOrCoreOrHead = requireRoles([ROLES.FACULTY, ROLES.CORE, ROLES.HEAD]);

