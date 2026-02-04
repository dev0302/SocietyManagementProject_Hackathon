import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Authentication middleware: identifies who you are.

export const auth = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    // Prefer explicit Authorization header over cookie so that
    // the currently logged-in user (token managed by frontend)
    // always takes precedence over any stale auth cookie.
    const token = headerToken || req.cookies?.Token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive.",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while authenticating.",
    });
  }
};

