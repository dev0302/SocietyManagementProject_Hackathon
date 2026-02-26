import mongoose from "mongoose";

// College belongs to a University. Has accessControl (adminEmails, facultyEmails).
// uniqueCode/code used by societies to associate; admin or accessControl.adminEmails for college admins.

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    uniqueCode: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    // For backward compat: existing colleges may have required admin; new ones can use accessControl only.
    accessControl: {
      type: {
        adminEmails: [{ type: String, trim: true, lowercase: true }],
        facultyEmails: [{ type: String, trim: true, lowercase: true }],
      },
      default: () => ({ adminEmails: [], facultyEmails: [] }),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("College", collegeSchema);

