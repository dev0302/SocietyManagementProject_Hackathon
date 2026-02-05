import mongoose from "mongoose";

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
    // New: associate a society with a college
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      index: true,
      default: null,
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

