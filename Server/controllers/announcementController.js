import Announcement from "../models/Announcement.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Core members can post announcements. For now, announcements are only
// linked to the creator; society/department are optional.
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = "ALL" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title and message are required.",
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience,
      createdBy: req.user.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "ANNOUNCEMENT_CREATED",
      targetModel: "Announcement",
      targetId: String(announcement._id),
      metadata: { audience },
    });

    return res.status(201).json({
      success: true,
      message: "Announcement created.",
      data: announcement,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create announcement.",
    });
  }
};

