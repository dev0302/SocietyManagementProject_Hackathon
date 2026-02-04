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
      required: true,
      index: true,
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

eventParticipantSchema.index({ event: 1, student: 1 }, { unique: true });

export default mongoose.model("EventParticipant", eventParticipantSchema);
