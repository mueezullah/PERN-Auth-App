import { Pool, types } from "pg";
import env from "./env.js";

// Override parsing for TIMESTAMP without time zone (OID 1114) to parse as UTC.
// By default, pg parses TIMESTAMP without time zone as local server time.
types.setTypeParser(1114, (stringValue) => {
  return new Date(stringValue.replace(" ", "T") + "Z");
});

export const pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  port: env.DB_PORT,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err));

export default pool;
