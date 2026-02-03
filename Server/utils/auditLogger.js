import AuditLog from "../models/AuditLog.js";

// Helper for creating audit logs for critical actions.

export const createAuditLog = async ({
  actorId,
  actorRole,
  action,
  targetModel,
  targetId,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor: actorId || null,
      actorRole: actorRole || null,
      action,
      targetModel,
      targetId,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    // Auditing must never break the main flow.
    // eslint-disable-next-line no-console
    console.error("Failed to create audit log:", error);
  }
};

