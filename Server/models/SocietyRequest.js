import mongoose from "mongoose";

// SocietyRequest represents an incoming request from a society
// to be onboarded under a particular college (via unique code).

const societyRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["TECH", "NON_TECH"],
      required: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    facultyName: {
      type: String,
      trim: true,
    },
    facultyEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    presidentName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    collegeCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    createdVia: {
      type: String,
      enum: ["LINK"],
      default: "LINK",
    },
  },
  { timestamps: true },
);

export default mongoose.model("SocietyRequest", societyRequestSchema);

