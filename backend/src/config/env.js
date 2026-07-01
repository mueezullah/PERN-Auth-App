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

const PUSHER_APP_ID=process.env.PUSHER_APP_ID;
const PUSHER_KEY=process.env.PUSHER_KEY;
const PUSHER_SECRET=process.env.PUSHER_SECRET;
const PUSHER_CLUSTER=process.env.PUSHER_CLUSTER;

export default {
  PORT,
  JWT_SECRET,
  DB_HOST,
  DB_USER,
  DB_PORT,
  DB_PASSWORD,
  DB_NAME,
  PUSHER_APP_ID,
  PUSHER_KEY,
  PUSHER_SECRET,
  PUSHER_CLUSTER,
};
