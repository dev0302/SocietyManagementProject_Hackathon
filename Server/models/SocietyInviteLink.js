import mongoose from "mongoose";

// Admin creates a link with faculty head email. When user with that email uses the link,
// they can create a society and become faculty coordinator.

const societyInviteLinkSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    facultyHeadEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
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
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
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

societyInviteLinkSchema.index({ token: 1 }, { unique: true });

export default mongoose.model("SocietyInviteLink", societyInviteLinkSchema);
