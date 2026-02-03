import mongoose from "mongoose";

// AuditLog stores all critical actions for traceability.

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorRole: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      trim: true,
      required: true,
    },
    targetModel: {
      type: String,
      trim: true,
      required: true,
    },
    targetId: {
      type: String,
      trim: true,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AuditLog", auditLogSchema);

