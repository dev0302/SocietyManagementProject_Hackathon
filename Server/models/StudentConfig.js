import mongoose from "mongoose";

const studentConfigSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
      unique: true,
    },
    // Primary email used for society president
    presidentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    // Whitelisted emails for core-role students (president, heads, core, etc.)
    coreEmails: {
      type: [String],
      default: [],
      set: (values) =>
        Array.from(
          new Set(
            (values || [])
              .map((v) => String(v).trim().toLowerCase())
              .filter((v) => !!v),
          ),
        ),
    },
  },
  { timestamps: true },
);

export default mongoose.model("StudentConfig", studentConfigSchema);

