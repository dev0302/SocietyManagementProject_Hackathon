import University from "../models/University.js";
import College from "../models/College.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Platform admin: create university
export const createUniversity = async (req, res) => {
  try {
    const { name, code, adminEmails } = req.body;
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required.",
      });
    }
    const normalizedCode = String(code).trim().toUpperCase();
    const existing = await University.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A university with this code already exists.",
      });
    }
    const emails = Array.isArray(adminEmails)
      ? adminEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean)
      : [];
    const university = await University.create({
      name: name.trim(),
      code: normalizedCode,
      adminEmails: emails,
    });
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "UNIVERSITY_CREATED",
      targetModel: "University",
      targetId: String(university._id),
      metadata: { code: university.code },
    });
    return res.status(201).json({
      success: true,
      message: "University created.",
      data: university,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create university.",
    });
  }
};

// Platform admin or university admin: list universities (platform sees all; university admin sees only their uni)
export const listUniversities = async (req, res) => {
  try {
    let query = {};
    if (req.university) {
      query = { _id: req.university._id };
    }
    const list = await University.find(query).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to list universities.",
    });
  }
};

// Get one university by id (public or authenticated)
export const getUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const university = await University.findById(universityId).lean();
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }
    return res.status(200).json({ success: true, data: university });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch university.",
    });
  }
};

// University admin or platform admin: update university
export const updateUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const { name, code, adminEmails } = req.body;
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ success: false, message: "University not found." });
    }
    if (req.university && String(req.university._id) !== String(universityId)) {
      return res.status(403).json({ success: false, message: "Not an admin for this university." });
    }
    if (name !== undefined) university.name = name.trim();
    if (code !== undefined) university.code = String(code).trim().toUpperCase();
    if (Array.isArray(adminEmails)) {
      university.adminEmails = adminEmails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    }
    await university.save();
    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "UNIVERSITY_UPDATED",
      targetModel: "University",
      targetId: String(university._id),
      metadata: {},
    });
    return res.status(200).json({ success: true, message: "University updated.", data: university });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update university.",
    });
  }
};

// List colleges under a university (by param or req.university from isUniversityAdmin)
export const listCollegesByUniversity = async (req, res) => {
  try {
    const universityId = req.params.universityId || (req.university && req.university._id);
    if (!universityId) {
      return res.status(400).json({ success: false, message: "University ID required." });
    }
    const colleges = await College.find({ university: universityId })
      .populate("university", "name code")
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, data: colleges });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to list colleges.",
    });
  }
};
