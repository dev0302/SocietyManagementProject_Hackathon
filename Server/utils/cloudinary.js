import { v2 as cloudinary } from "cloudinary";

export const connectCloudinary = () => {
  
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // eslint-disable-next-line no-console
    console.log("Cloudinary connected successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error while connecting to Cloudinary", error);
  }
};

export default cloudinary;

