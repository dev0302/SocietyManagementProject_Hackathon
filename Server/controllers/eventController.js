import Event from "../models/Event.js";
import Society from "../models/Society.js";
import Certificate from "../models/Certificate.js";
import EventParticipant from "../models/EventParticipant.js";
import EventInvite from "../models/EventInvite.js";
import User from "../models/User.js";
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
    const {
      title,
      description,
      date,
      venue,
      societyId,
      posterUrl,
      eventType,
      sendReminder,
      reminderAt,
      participants,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: "title and date are required.",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim() || "",
      posterUrl: posterUrl?.trim() || "",
      venue: venue?.trim() || "",
      date: new Date(date),
      eventType: eventType === "NON_TECH" ? "NON_TECH" : "TECH",
      sendReminder: Boolean(sendReminder),
      reminderAt: sendReminder && reminderAt ? new Date(reminderAt) : null,
      society: societyId || null,
      createdBy: req.user.id,
    });

    const participantsList = Array.isArray(participants) ? participants : [];
    for (const p of participantsList) {
      const email = (p.email || p).toString().trim().toLowerCase();
      const role = (p.role || "Participant").toString().trim();
      if (!email) continue;
      const student = await User.findOne({ email, role: "STUDENT" });
      if (student) {
        await EventParticipant.findOneAndUpdate(
          { event: event._id, student: student._id },
          { event: event._id, student: student._id, role },
          { upsert: true },
        );
      }
    }

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
    const { studentId, societyId, eventId, content, serialNo } = req.body;

    if (!studentId || !societyId) {
      return res.status(400).json({
        success: false,
        message: "studentId and societyId are required.",
      });
    }
    if (!serialNo || !String(serialNo).trim()) {
      return res.status(400).json({
        success: false,
        message: "Certificate serial number is required.",
      });
    }

    const certificate = await Certificate.create({
      student: studentId,
      society: societyId,
      event: eventId || null,
      issuedBy: req.user.id,
      serialNo: String(serialNo).trim(),
      content: content?.trim() || "",
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "CERTIFICATE_ISSUED",
      targetModel: "Certificate",
      targetId: String(certificate._id),
      metadata: { studentId, serialNo: certificate.serialNo },
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued.",
      data: certificate,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A certificate with this serial number already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
    });
  }
};

// Get single event with participants (for detail / past event certificate flow)
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate("society", "name category logoUrl facultyCoordinator")
      .lean();
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }
    const participants = await EventParticipant.find({ event: eventId })
      .populate("student", "firstName lastName email avatarUrl")
      .lean();
    const certificates = await Certificate.find({ event: eventId })
      .populate("student", "firstName lastName email")
      .lean();
    return res.status(200).json({
      success: true,
      data: { ...event, participants, certificates },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
    });
  }
};

// Get participants for an event
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const participants = await EventParticipant.find({ event: eventId })
      .populate("student", "firstName lastName email avatarUrl")
      .lean();
    return res.status(200).json({ success: true, data: participants });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch participants.",
    });
  }
};

// Create event invite (for link/QR enrollment)
export const createEventInvite = async (req, res) => {
  try {
    const { eventId, email, role } = req.body;
    if (!eventId || !email) {
      return res.status(400).json({
        success: false,
        message: "eventId and email are required.",
      });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    const society = event.society
      ? await Society.findById(event.society).select("facultyCoordinator").lean()
      : null;
    const isFaculty = society && String(society.facultyCoordinator) === String(req.user.id);
    if (!event.society || !isFaculty) {
      return res.status(403).json({
        success: false,
        message: "You can only create invites for events of your society.",
      });
    }
    const token = `ei-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const invite = await EventInvite.create({
      event: eventId,
      email: email.toLowerCase().trim(),
      role: (role || "Participant").toString().trim(),
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: req.user.id,
    });
    const baseUrl =
      process.env.CLIENT_URL || (req.get("origin") || "http://localhost:5173").replace(/\/$/, "");
    const link = `${baseUrl}/events/join?token=${encodeURIComponent(invite.token)}`;
    return res.status(201).json({
      success: true,
      data: { inviteId: invite._id, token: invite.token, link },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create event invite.",
    });
  }
};

// Accept event invite (student)
export const acceptEventInvite = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required.",
      });
    }
    const invite = await EventInvite.findOne({ token });
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
    if (invite.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "This invite is for a different email.",
      });
    }
    await EventParticipant.findOneAndUpdate(
      { event: invite.event, student: req.user.id },
      { event: invite.event, student: req.user.id, role: invite.role },
      { upsert: true },
    );
    invite.used = true;
    invite.usedAt = new Date();
    await invite.save();
    return res.status(200).json({
      success: true,
      message: "You have been added to the event.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept event invite.",
    });
  }
};

// Public: get event invite by token
export const getEventInviteByToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }
    const invite = await EventInvite.findOne({ token })
      .populate("event", "title date venue society")
      .lean();
    if (!invite || invite.used) {
      return res.status(404).json({ success: false, message: "Invite not found or already used." });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invite has expired." });
    }
    return res.status(200).json({
      success: true,
      data: {
        eventTitle: invite.event?.title,
        eventId: invite.event?._id,
        email: invite.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invite.",
    });
  }
};

