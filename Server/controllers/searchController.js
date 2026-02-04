import User from "../models/User.js";

// Search users by name or email for navbar search.
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        results: [],
      });
    }

    const query = q.trim();

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ],
    })
      .limit(8)
      .select("firstName lastName email role avatarUrl")
      .lean();

    return res.status(200).json({
      success: true,
      results: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while searching users.",
    });
  }
};

