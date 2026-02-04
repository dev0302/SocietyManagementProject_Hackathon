import { createAuditLog } from "../utils/auditLogger.js";

// These endpoints are intentionally lightweight and mostly for logging/demo purposes.

export const handleMemberDecision = async (req, res) => {
  try {
    const { name, email, decision } = req.body;

    if (!name || !email || !decision) {
      return res.status(400).json({
        success: false,
        message: "name, email, and decision are required.",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: decision === "APPROVE" ? "CORE_MEMBER_APPROVED" : "CORE_MEMBER_REJECTED",
      targetModel: "User",
      targetId: email,
      metadata: { name, email },
    });

    return res.status(200).json({
      success: true,
      message: `Member request ${decision.toLowerCase()}d.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process member decision.",
    });
  }
};

export const handleMemberRoleChange = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, and role are required.",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "CORE_MEMBER_ROLE_CHANGED",
      targetModel: "User",
      targetId: email,
      metadata: { name, email, role },
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update member role.",
    });
  }
};

export const getDepartmentsSummary = async (req, res) => {
  try {
    // For now, return a static summary similar to the frontend mock data.
    const departments = [
      {
        id: 1,
        name: "Technical",
        head: "Arjun Mehta",
        membersCount: 24,
      },
      {
        id: 2,
        name: "Design",
        head: "Sara Khan",
        membersCount: 15,
      },
      {
        id: 3,
        name: "Public Relations",
        head: "Rohan Das",
        membersCount: 18,
      },
      {
        id: 4,
        name: "Operations",
        head: "Priya Iyer",
        membersCount: 20,
      },
    ];

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load departments.",
    });
  }
};

