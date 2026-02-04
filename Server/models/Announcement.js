import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    audience: {
      type: String,
      enum: ["ALL", "MEMBERS", "VOLUNTEERS"],
      default: "ALL",
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Announcement", announcementSchema);

