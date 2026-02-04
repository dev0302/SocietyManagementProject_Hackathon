import mongoose from "mongoose";

// SocietyRequest represents a request from a society to join a college.
// This is used when a society wants to associate itself with a college using the college's unique code.

const SOCIETY_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const societyRequestSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    collegeCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(SOCIETY_REQUEST_STATUS),
      default: SOCIETY_REQUEST_STATUS.PENDING,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true },
);

societyRequestSchema.index({ college: 1, status: 1 });
societyRequestSchema.index({ society: 1 });

export { SOCIETY_REQUEST_STATUS };
export default mongoose.model("SocietyRequest", societyRequestSchema);
