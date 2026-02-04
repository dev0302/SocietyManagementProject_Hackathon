import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { createAuditLog } from "../utils/auditLogger.js";

// Get current user's profile (user + profile populated)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("profile")
      .populate("membership")
      .exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};

// Update basic profile details
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      gender,
      dob,
      about,
      phoneNumber,
      departmentId,
      yearOfStudy,
      socials,
    } = req.body;

    const user = await User.findById(userId).populate("profile").exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    let profile = user.profile
      ? user.profile
      : await Profile.create({ user: user._id });

    if (!user.profile) {
      user.profile = profile._id;
    }

    if (gender !== undefined) profile.gender = gender;
    if (dob !== undefined) profile.dob = dob ? new Date(dob) : null;
    if (about !== undefined) profile.about = about;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;
    if (departmentId !== undefined) profile.department = departmentId || null;
    if (yearOfStudy !== undefined) profile.yearOfStudy = yearOfStudy;
    if (socials && typeof socials === "object") {
      profile.socials = {
        instagram: socials.instagram || profile.socials?.instagram,
        linkedin: socials.linkedin || profile.socials?.linkedin,
        github: socials.github || profile.socials?.github,
      };
    }

    await user.save();
    await profile.save();

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "PROFILE_UPDATED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: {},
    });

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("profile")
      .populate("membership")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile.",
    });
  }
};

// Update avatar / display picture
export const updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.files || !req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: "No avatar file uploaded.",
      });
    }

    const avatarFile = req.files.avatar;

    const uploadResponse = await uploadImageToCloudinary(
      avatarFile,
      process.env.CLOUDINARY_AVATAR_FOLDER || "cozen/avatars",
      80,
    );

    const user = await User.findById(userId).populate("profile").exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.avatarUrl = uploadResponse.secure_url;

    let profile = user.profile
      ? user.profile
      : await Profile.create({ user: user._id });

    if (!user.profile) {
      user.profile = profile._id;
    }

    profile.avatarUrl = uploadResponse.secure_url;

    await user.save();
    await profile.save();

    await createAuditLog({
      actorId: user._id,
      actorRole: user.role,
      action: "AVATAR_UPDATED",
      targetModel: "User",
      targetId: String(user._id),
      metadata: { avatarUrl: uploadResponse.secure_url },
    });

    const updatedUser = await User.findById(userId)
      .select("-password")
      .populate("profile")
      .populate("membership")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:error,
      success: false,
      message: "Server error while updating display picture.",
    })
  }
};

