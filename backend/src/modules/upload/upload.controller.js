import { uploadToS3 } from "../../utils/s3.service.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const folder = req.body.folder || "uploads";
    const imageUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully to AWS S3",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image to S3",
    });
  }
};
