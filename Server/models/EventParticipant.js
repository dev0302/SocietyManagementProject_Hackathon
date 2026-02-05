import mongoose from "mongoose";

// Students participating in an event with a specific role (e.g. Organizer, Volunteer, Participant).

const eventParticipantSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      trim: true,
      required: true,
      default: "Participant",
    },
  },
  { timestamps: true },
);

// Unique per event when linked to a student
eventParticipantSchema.index(
  { event: 1, student: 1 },
  { unique: true, partialFilterExpression: { student: { $ne: null } } },
);
// Unique per event when guest (email only)
eventParticipantSchema.index(
  { event: 1, email: 1 },
  { unique: true, partialFilterExpression: { student: null, email: { $ne: "" } } },
);

export default mongoose.model("EventParticipant", eventParticipantSchema);
