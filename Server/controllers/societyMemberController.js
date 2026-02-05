import Society from "../models/Society.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { ROLES } from "../config/roles.js";

// Helper: ensure user is admin or faculty coordinator of this society
const canManageSociety = (society, userId, userRole) => {
  if (userRole === ROLES.ADMIN) return true;
  if (userRole === ROLES.FACULTY && society && String(society.facultyCoordinator) === String(userId))
    return true;
  return false;
};

// GET /api/societies/:societyId/members – list enrolled members with full details (name, branch, sem, position, email)
export const getSocietyMembers = async (req, res) => {
  try {
    const { societyId } = req.params;
    const society = await Society.findById(societyId).lean();
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found." });
    }
    if (!canManageSociety(society, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty coordinator or admin can view society members.",
      });
    }

    const memberships = await Membership.find({ society: societyId, isActive: true })
      .populate("student", "firstName lastName email")
      .populate("department", "name")
      .sort({ role: 1, createdAt: 1 })
      .lean();

    const userIds = memberships.map((m) => m.student?._id).filter(Boolean);
    const profiles = await Profile.find({ user: { $in: userIds } })
      .select("user branch sem yearOfStudy department")
      .lean();
    const profileByUser = {};
    profiles.forEach((p) => {
      profileByUser[String(p.user)] = p;
    });

    const data = memberships.map((m) => {
      const user = m.student;
      const profile = user ? profileByUser[String(user._id)] : null;
      return {
        _id: m._id,
        name: user ? `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() || user.email : "—",
        email: user?.email || "—",
        branch: profile?.branch ?? "",
        sem: profile?.sem ?? "",
        year: profile?.yearOfStudy ?? "",
        department: m.department?.name ?? (profile?.department ? String(profile.department) : ""),
        position: m.role || "MEMBER",
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch society members.",
    });
  }
};

// GET /api/societies/:societyId/members/export – download Excel of all enrolled members (name, branch, sem, position, email)
export const exportSocietyMembersExcel = async (req, res) => {
  try {
    const { societyId } = req.params;
    const society = await Society.findById(societyId).lean();
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found." });
    }
    if (!canManageSociety(society, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty coordinator or admin can export society members.",
      });
    }

    const memberships = await Membership.find({ society: societyId, isActive: true })
      .populate("student", "firstName lastName email")
      .populate("department", "name")
      .sort({ role: 1, createdAt: 1 })
      .lean();

    const userIds = memberships.map((m) => m.student?._id).filter(Boolean);
    const profiles = await Profile.find({ user: { $in: userIds } })
      .select("user branch sem yearOfStudy")
      .lean();
    const profileByUser = {};
    profiles.forEach((p) => {
      profileByUser[String(p.user)] = p;
    });

    const rows = memberships.map((m) => {
      const user = m.student;
      const profile = user ? profileByUser[String(user._id)] : null;
      const name = user ? `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() || user.email : "—";
      return {
        name,
        email: user?.email || "",
        branch: profile?.branch ?? "",
        sem: profile?.sem ?? "",
        year: profile?.yearOfStudy ?? "",
        department: m.department?.name ?? "",
        position: m.role || "MEMBER",
      };
    });

    let XLSX;
    try {
      XLSX = await import("xlsx");
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Excel export not available. Install xlsx package.",
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `society_${(society.name || "members").replace(/[^a-z0-9_-]/gi, "_")}_members.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export members.",
    });
  }
};
