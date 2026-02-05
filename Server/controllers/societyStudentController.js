import Society from "../models/Society.js";
import SocietyStudent from "../models/SocietyStudent.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Helper: ensure user is admin or faculty coordinator of this society
const canManageSocietyStudents = (society, userId, userRole) => {
  if (userRole === ROLES.ADMIN) return true;
  if (userRole === ROLES.FACULTY && society && String(society.facultyCoordinator) === String(userId))
    return true;
  return false;
};

// GET /api/societies/:societyId/students – list students (faculty coordinator or admin)
export const getSocietyStudents = async (req, res) => {
  try {
    const { societyId } = req.params;
    const society = await Society.findById(societyId).lean();
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found." });
    }
    if (!canManageSocietyStudents(society, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty coordinator or admin can view society students.",
      });
    }
    const students = await SocietyStudent.find({ society: societyId })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch society students.",
    });
  }
};

// POST /api/societies/:societyId/students – add/replace students (body: { students: [...] })
export const addSocietyStudents = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { students: studentsList, replace } = req.body;

    const society = await Society.findById(societyId).lean();
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found." });
    }
    if (!canManageSocietyStudents(society, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty coordinator or admin can manage society students.",
      });
    }

    const list = Array.isArray(studentsList) ? studentsList : [];
    const toInsert = list
      .map((row) => {
        const name = (row.name ?? row.Name ?? "").toString().trim();
        if (!name) return null;
        return {
          society: societyId,
          name,
          branch: (row.branch ?? row.Branch ?? "").toString().trim(),
          sem: (row.sem ?? row.Sem ?? "").toString().trim(),
          year: (row.year ?? row.Year ?? "").toString().trim(),
          department: (row.department ?? row.Department ?? "").toString().trim(),
          position: (row.position ?? row.Position ?? "").toString().trim(),
        };
      })
      .filter(Boolean);

    if (replace) {
      await SocietyStudent.deleteMany({ society: societyId });
    }
    if (toInsert.length > 0) {
      await SocietyStudent.insertMany(toInsert);
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_STUDENTS_UPDATED",
      targetModel: "SocietyStudent",
      targetId: String(societyId),
      metadata: { count: toInsert.length, replace: Boolean(replace) },
    });

    const students = await SocietyStudent.find({ society: societyId }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: `${toInsert.length} student(s) added.`,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add society students.",
    });
  }
};

// POST /api/societies/:societyId/students/upload – upload Excel file (multipart)
export const uploadSocietyStudentsExcel = async (req, res) => {
  try {
    const { societyId } = req.params;
    const society = await Society.findById(societyId).lean();
    if (!society) {
      return res.status(404).json({ success: false, message: "Society not found." });
    }
    if (!canManageSocietyStudents(society, req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty coordinator or admin can upload society students.",
      });
    }

    const file = req.files?.file || req.files?.excel;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Use form field 'file' or 'excel'.",
      });
    }

    let XLSX;
    try {
      XLSX = await import("xlsx");
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Excel parsing is not available. Install xlsx package or use JSON API.",
      });
    }

    const isCsv = (file.name || "").toLowerCase().endsWith(".csv");
    const data = isCsv ? (file.data?.toString?.("utf8") ?? file.data) : file.data;
    const workbook = XLSX.read(data, { type: isCsv ? "string" : "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const toInsert = rows
      .map((row) => {
        const name = (row.name ?? row.Name ?? row.NAME ?? "").toString().trim();
        if (!name) return null;
        return {
          society: societyId,
          name,
          branch: (row.branch ?? row.Branch ?? row.BRANCH ?? "").toString().trim(),
          sem: (row.sem ?? row.Sem ?? row.SEM ?? "").toString().trim(),
          year: (row.year ?? row.Year ?? row.YEAR ?? "").toString().trim(),
          department: (row.department ?? row.Department ?? row.DEPARTMENT ?? "").toString().trim(),
          position: (row.position ?? row.Position ?? row.POSITION ?? "").toString().trim(),
        };
      })
      .filter(Boolean);

    await SocietyStudent.deleteMany({ society: societyId });
    if (toInsert.length > 0) {
      await SocietyStudent.insertMany(toInsert);
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "SOCIETY_STUDENTS_UPLOADED",
      targetModel: "SocietyStudent",
      targetId: String(societyId),
      metadata: { count: toInsert.length },
    });

    const students = await SocietyStudent.find({ society: societyId }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: `Uploaded ${toInsert.length} student(s) from Excel.`,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload Excel.",
    });
  }
};
