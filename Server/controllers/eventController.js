import Event from "../models/Event.js";
import Society from "../models/Society.js";
import Certificate from "../models/Certificate.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Helper to get date boundaries for filter
const getDateRange = (filter) => {
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

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, societyId } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: "title and date are required.",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim() || "",
      venue: venue?.trim() || "",
      date: new Date(date),
      society: societyId || null,
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "EVENT_CREATED",
      targetModel: "Event",
      targetId: String(event._id),
      metadata: { societyId: societyId || null },
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

// Get events for a specific society (used by society detail page)
// Query: filter=upcoming|today|yesterday|tomorrow|past, category=TECH|NON_TECH
export const getSocietyEvents = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { filter, category } = req.query;

    if (category && ["TECH", "NON_TECH"].includes(category)) {
      const soc = await Society.findById(societyId).select("category");
      if (!soc || soc.category !== category) {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    const match = { society: societyId };
    const dateRange = filter ? getDateRange(filter) : null;
    if (dateRange) {
      match.date = dateRange;
    }

    const events = await Event.find(match)
      .populate("society", "name category logoUrl")
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch society events.",
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

