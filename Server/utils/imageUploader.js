import cloudinary from "./cloudinary.js";

const SUPPORTED_IMAGE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "tiff",
  "tif",
  "heic",
  "heif",
  "avif",
  "raw",
  "ico",
];

function isFileTypeSupported(supportedTypes, fileType) {
  return supportedTypes.includes(fileType);
}

export const uploadImageToCloudinary = async (file, folder, quality) => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  if (!file.name || !file.name.includes(".")) {
    throw new Error("Invalid file name. File must have an extension.");
  }

  const fileType = file.name.split(".").pop().toLowerCase();

  if (!isFileTypeSupported(SUPPORTED_IMAGE_TYPES, fileType)) {
    throw new Error(
      `.${fileType} files are not supported. Allowed: ${SUPPORTED_IMAGE_TYPES.join(", ")}`,
    );
  }

  const options = {
    folder,
    public_id: file.name.split(".")[0],
    resource_type: "image",
  };

  if (quality) {
    options.quality = quality;
  }

  const response = await cloudinary.uploader.upload(file.tempFilePath, options);
  return response;
};

