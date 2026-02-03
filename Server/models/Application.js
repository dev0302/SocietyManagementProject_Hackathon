import mongoose from "mongoose";

const APPLICATION_STATUS = {
  APPLIED: "APPLIED",
  SHORTLISTED: "SHORTLISTED",
  SELECTED: "SELECTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
};

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    answers: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

export { APPLICATION_STATUS };
export default mongoose.model("Application", applicationSchema);

