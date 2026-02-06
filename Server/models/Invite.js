import mongoose from "mongoose";
import { ROLES } from "../config/roles.js";

// Invite is the only way to join internal society roles (CORE/HEAD/MEMBER).

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    role: {
      type: String,
      enum: [ROLES.CORE, ROLES.HEAD, ROLES.MEMBER, ROLES.PRESIDENT],
      required: true,
    },
    token: {
      type: String,
      required: true,
      // unique: true,
      // index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

inviteSchema.index({ email: 1, society: 1, role: 1 });

export default mongoose.model("Invite", inviteSchema);

