import mongoose from "mongoose";

const RECOMMENDATION = {
  REJECT: "REJECT",
  HOLD: "HOLD",
  SELECT: "SELECT",
};

const interviewFeedbackSchema = new mongoose.Schema(
  {
    panel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewPanel",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    recommendation: {
      type: String,
      enum: Object.values(RECOMMENDATION),
      required: true,
    },
  },
  { timestamps: true },
);

interviewFeedbackSchema.index(
  { panel: 1, interviewer: 1, application: 1 },
  { unique: true },
);

export { RECOMMENDATION };
export default mongoose.model("InterviewFeedback", interviewFeedbackSchema);

