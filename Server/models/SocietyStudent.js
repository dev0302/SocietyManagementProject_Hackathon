import mongoose from "mongoose";

// Society student roster: name, branch, sem, year, department, position.
// Used for Excel-style listing; access restricted to faculty (society coordinator) and admin.

const societyStudentSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    sem: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    position: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

societyStudentSchema.index({ society: 1 });

export default mongoose.model("SocietyStudent", societyStudentSchema);
