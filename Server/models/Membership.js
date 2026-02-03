import mongoose from "mongoose";
import { ROLES } from "../config/roles.js";

// One active membership per student.
// This is the final authority for society, department, and role.

const membershipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Enforces one active membership per student document-wide
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
      enum: [ROLES.CORE, ROLES.HEAD, ROLES.MEMBER],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Membership", membershipSchema);

