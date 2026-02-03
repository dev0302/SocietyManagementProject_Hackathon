import PlatformConfig from "../models/PlatformConfig.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Admin manages faculty access and platform config.

export const getPlatformConfig = async (req, res) => {
  try {
    const config =
      (await PlatformConfig.findOne()) ||
      (await PlatformConfig.create({
        adminEmails: [],
        facultyWhitelist: [],
      }));

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform config.",
    });
  }
};

export const updatePlatformConfig = async (req, res) => {
  try {
    const { adminEmails, facultyWhitelist } = req.body;

    const normalizedAdminEmails = Array.isArray(adminEmails)
      ? adminEmails.map((e) => e.toLowerCase())
      : undefined;
    const normalizedFacultyEmails = Array.isArray(facultyWhitelist)
      ? facultyWhitelist.map((e) => e.toLowerCase())
      : undefined;

    const config =
      (await PlatformConfig.findOne()) ||
      (await PlatformConfig.create({
        adminEmails: [],
        facultyWhitelist: [],
      }));

    if (normalizedAdminEmails) {
      config.adminEmails = normalizedAdminEmails;
    }
    if (normalizedFacultyEmails) {
      config.facultyWhitelist = normalizedFacultyEmails;
    }

    await config.save();

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "PLATFORM_CONFIG_UPDATED",
      targetModel: "PlatformConfig",
      targetId: String(config._id),
      metadata: {
        adminEmails: config.adminEmails,
        facultyWhitelist: config.facultyWhitelist,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Platform config updated.",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update platform config.",
    });
  }
};

