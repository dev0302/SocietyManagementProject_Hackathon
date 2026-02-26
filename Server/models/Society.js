import mongoose from "mongoose";

// Society belongs to one University and one College. Core → Head → Member hierarchy within society.

const societySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    facultyCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
      index: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      index: true,
      default: null,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
      index: true,
    },
    roleConfig: {
      coreEmails: [{ type: String, trim: true, lowercase: true }],
      headEmails: [{ type: String, trim: true, lowercase: true }],
      memberEmails: [{ type: String, trim: true, lowercase: true }],
    },
    // New: tech / non-tech flag
    category: {
      type: String,
      enum: ["TECH", "NON_TECH"],
      default: "TECH",
    },
    // New: additional metadata filled during society onboarding
    logoUrl: {
      type: String,
      trim: true,
    },
    facultyName: {
      type: String,
      trim: true,
    },
    presidentName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    registrationStatus: {
      type: String,
      enum: ["PENDING", "REGISTERED"],
      default: "PENDING",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Society", societySchema);

