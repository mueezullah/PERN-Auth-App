import "dotenv/config";

const requiredEnvs = ["JWT_SECRET", "DB_PASSWORD"];
const missingEnvs = requiredEnvs.filter((envName) => !process.env[envName]);

if (missingEnvs.length > 0) {
  console.error(
    `🚨 FATAL CONFIG ERROR: Missing required environment variables: ${missingEnvs.join(", ")}`,
  );
  throw new Error(`Configuration Failed: Missing env variables [${missingEnvs.join(", ")}]`)
}

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PORT = process.env.DB_PORT;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || "pern_auth";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export default {
  PORT,
  JWT_SECRET,
  DB_HOST,
  DB_USER,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
  CLIENT_URL,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
};
