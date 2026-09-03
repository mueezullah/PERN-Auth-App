import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Uploads a buffer to AWS S3 and returns the public URL.
 * 
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} originalName - Original name of the uploaded file
 * @param {string} mimeType - MIME type of the file (e.g., image/jpeg)
 * @param {string} folder - Folder inside S3 bucket (e.g., "avatars", "posts", "campaigns")
 * @returns {Promise<string>} S3 public object URL
 */
export const uploadToS3 = async (fileBuffer, originalName, mimeType, folder = "uploads") => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 configuration missing. Please specify AWS credentials and AWS_S3_BUCKET_NAME in .env");
  }

  // Clean filename and create unique S3 key
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${Date.now()}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Construct standard AWS S3 public URL
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  return publicUrl;
};
