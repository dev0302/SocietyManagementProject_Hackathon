import mongoose from "mongoose";

// Profile stores extended user information for the society platform.
// Keep auth-related fields (email, password, role) on the User model.

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      trim: true,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    dob: {
      type: Date,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    yearOfStudy: {
      type: String,
      trim: true,
    },
    socials: {
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Profile", profileSchema);

