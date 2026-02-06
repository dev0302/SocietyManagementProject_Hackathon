import mongoose from "mongoose";

// Invite for event participation (same link/QR concept as society invites).

const eventInviteSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      default: "Participant",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
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

eventInviteSchema.index({ event: 1, email: 1 });

export default mongoose.model("EventInvite", eventInviteSchema);
