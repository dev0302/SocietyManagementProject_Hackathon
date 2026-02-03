import Application, { APPLICATION_STATUS } from "../models/Application.js";
import InterviewPanel from "../models/InterviewPanel.js";
import InterviewFeedback, { RECOMMENDATION } from "../models/InterviewFeedback.js";
import Membership from "../models/Membership.js";
import { ROLES } from "../config/roles.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Students apply to a society.

export const createApplication = async (req, res) => {
  try {
    const { societyId, departmentId, answers } = req.body;

    if (!societyId) {
      return res.status(400).json({
        success: false,
        message: "societyId is required.",
      });
    }

    const existing = await Application.findOne({
      student: req.user.id,
      society: societyId,
      status: { $in: [APPLICATION_STATUS.APPLIED, APPLICATION_STATUS.SHORTLISTED] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have an active application for this society.",
      });
    }

    const application = await Application.create({
      student: req.user.id,
      society: societyId,
      department: departmentId || null,
      answers: answers || {},
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "APPLICATION_CREATED",
      targetModel: "Application",
      targetId: String(application._id),
      metadata: { societyId },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted.",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create application.",
    });
  }
};

// Societies create interview panels.

export const createInterviewPanel = async (req, res) => {
  try {
    const { name, societyId, departmentId, applicationIds, interviewerIds } = req.body;

    if (!name || !societyId) {
      return res.status(400).json({
        success: false,
        message: "name and societyId are required.",
      });
    }

    const panel = await InterviewPanel.create({
      name: name.trim(),
      society: societyId,
      department: departmentId || null,
      applications: applicationIds || [],
      interviewers: interviewerIds || [],
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "INTERVIEW_PANEL_CREATED",
      targetModel: "InterviewPanel",
      targetId: String(panel._id),
      metadata: {},
    });

    return res.status(201).json({
      success: true,
      message: "Interview panel created.",
      data: panel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create interview panel.",
    });
  }
};

// Each interviewer submits independent feedback.

export const submitInterviewFeedback = async (req, res) => {
  try {
    const { panelId, applicationId, rating, comments, recommendation } = req.body;

    if (!panelId || !applicationId || !rating || !recommendation) {
      return res.status(400).json({
        success: false,
        message: "panelId, applicationId, rating, and recommendation are required.",
      });
    }

    if (!Object.values(RECOMMENDATION).includes(recommendation)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recommendation value.",
      });
    }

    const feedback = await InterviewFeedback.create({
      panel: panelId,
      application: applicationId,
      interviewer: req.user.id,
      rating,
      comments: comments || "",
      recommendation,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "INTERVIEW_FEEDBACK_SUBMITTED",
      targetModel: "InterviewFeedback",
      targetId: String(feedback._id),
      metadata: { panelId, applicationId },
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted.",
      data: feedback,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Feedback already submitted for this application by this interviewer.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
    });
  }
};

// Conflict rule: student may be selected by multiple societies but must choose one.

export const chooseFinalSociety = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "applicationId is required.",
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      student: req.user.id,
      status: APPLICATION_STATUS.SELECTED,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Selected application not found.",
      });
    }

    // Auto-reject other selected offers
    await Application.updateMany(
      {
        student: req.user.id,
        _id: { $ne: application._id },
        status: APPLICATION_STATUS.SELECTED,
      },
      { status: APPLICATION_STATUS.REJECTED },
    );

    // Close the chosen application as final (keep SELECTED)

    // Update membership according to chosen society.
    const existingMembership = await Membership.findOne({
      student: req.user.id,
      isActive: true,
    });

    if (existingMembership) {
      existingMembership.isActive = false;
      existingMembership.endedAt = new Date();
      await existingMembership.save();
    }

    const membership = await Membership.create({
      student: req.user.id,
      society: application.society,
      department: application.department || null,
      role: ROLES.MEMBER,
    });

    await createAuditLog({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: "FINAL_SOCIETY_CHOSEN",
      targetModel: "Membership",
      targetId: String(membership._id),
      metadata: { applicationId: application._id },
    });

    return res.status(200).json({
      success: true,
      message: "Final society chosen. Membership updated.",
      data: membership,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to choose final society.",
    });
  }
};

