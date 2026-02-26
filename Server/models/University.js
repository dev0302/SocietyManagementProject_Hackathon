import mongoose from "mongoose";

// University sits above College. Platform can have many universities;
// each university has adminEmails and contains multiple colleges.

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    adminEmails: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true },
);

universitySchema.index({ code: 1 }, { unique: true });

export default mongoose.model("University", universitySchema);
