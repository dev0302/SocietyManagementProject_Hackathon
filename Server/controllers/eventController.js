import Event from "../models/Event.js";
import Certificate from "../models/Certificate.js";
import { createAuditLog } from "../utils/auditLogger.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, societyId, departmentId } = req.body;

    if (!title || !date || !societyId) {
      return res.status(400).json({
        success: false,
        message: "title, date, and societyId are required.",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim() || "",
      date: new Date(date),
      society: societyId,
      department: departmentId || null,
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "EVENT_CREATED",
      targetModel: "Event",
      targetId: String(event._id),
      metadata: {},
    });

    return res.status(201).json({
      success: true,
      message: "Event created.",
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
    });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const { studentId, societyId, eventId, content } = req.body;

    if (!studentId || !societyId || !content) {
      return res.status(400).json({
        success: false,
        message: "studentId, societyId, and content are required.",
      });
    }

    const certificate = await Certificate.create({
      student: studentId,
      society: societyId,
      event: eventId || null,
      issuedBy: req.user.id,
      content: content.trim(),
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "CERTIFICATE_ISSUED",
      targetModel: "Certificate",
      targetId: String(certificate._id),
      metadata: { studentId },
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued.",
      data: certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
    });
  }
};

