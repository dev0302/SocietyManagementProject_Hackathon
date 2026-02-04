import { ROLES } from "../config/roles.js";

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
export const isFaculty = requireRoles([ROLES.FACULTY]);
export const isCore = requireRoles([ROLES.CORE]);
export const isHead = requireRoles([ROLES.HEAD]);
export const isMember = requireRoles([ROLES.MEMBER]);
export const isFacultyOrCoreOrHead = requireRoles([ROLES.FACULTY, ROLES.CORE, ROLES.HEAD]);

