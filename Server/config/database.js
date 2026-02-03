import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);


import mongoose from "mongoose";

// Database connection helper
// Follows your style: small focused function, clear logs, hard fail on error.

export const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    await mongoose.connect(dbUrl, {
      autoIndex: true,
    });

    // eslint-disable-next-line no-console
    console.log("✅ MongoDB connected");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection error");
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

