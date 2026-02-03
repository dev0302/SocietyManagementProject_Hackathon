import mongoose from "mongoose";

// PlatformConfig centralizes platform-wide settings.
// Admin emails and faculty pre-approvals are stored here for auditability.

const platformConfigSchema = new mongoose.Schema(
  {
    adminEmails: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    facultyWhitelist: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("PlatformConfig", platformConfigSchema);

