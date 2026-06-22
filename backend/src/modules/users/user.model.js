import pool from "../../config/db.js";

// Define the User schema structure (for documentation/validation)
export const UserSchema = {
  id: "SERIAL PRIMARY KEY",
  name: "VARCHAR(255) NOT NULL",
  username: "VARCHAR(20) UNIQUE NOT NULL",
  email: "VARCHAR(255) UNIQUE NOT NULL",
  password: "VARCHAR(255) NOT NULL",
  role: "VARCHAR(20) NOT NULL DEFAULT 'user'",
  kyc_verified: "BOOLEAN DEFAULT FALSE",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
};

// Initialize/Create table if it doesn't exist
export const initializeTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(20) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      kyc_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    // Add column if it doesn't exist to support existing databases
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
    `);

    // Check if column username exists.
    const checkUsernameCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username';
    `);

    if (checkUsernameCol.rows.length === 0) {
      console.log("Adding username column to existing users table...");
      // Add column as nullable first to prevent NOT NULL constraints violation on existing rows
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(20);
      `);

      // Populate nullable username with a safe fallback using user id
      await pool.query(`
        UPDATE users 
        SET username = 'user_' || id 
        WHERE username IS NULL;
      `);

      // Set it as NOT NULL
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN username SET NOT NULL;
      `);

      // Add unique constraint
      await pool.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_username_key UNIQUE (username);
      `);
    }
    console.log("Users table is ready");
  } catch (error) {
    console.error("Error initializing users table:", error);
    throw error;
  }
};

// User Model with all operations
export const create = async (name, username, email, password) => {
  const query = `
      INSERT INTO users (name, username, email, password) 
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, username, email, role, kyc_verified, created_at;
    `;
  const values = [name, username, email, password];
  const result = await pool.query(query, values); // Removed redundant try/catch blocks
  return result.rows[0];
};

export const findByUsername = async(username) => {
  const query = "SELECT * FROM users WHERE username = $1";
  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
}

// READ - Find user by email (for sign-in)
export const findByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

// READ - Find user by ID
export const findById = async (id) => {
  const query = "SELECT id, name, username, email, role, kyc_verified, created_at FROM users WHERE id = $1"; // Added role back to selection
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// READ - Get all users
export const findAll = async () => {
  const query = "SELECT id, name, username, email, role, kyc_verified, created_at FROM users ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
};

// UPDATE - Update user details dynamically using COALESCE
export const update = async (id, { name = null, username = null, email = null, role = null, kyc_verified = null } = {}) => {
  const query = `
    UPDATE users 
    SET name = COALESCE($1, name), 
        username = COALESCE($2, username),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        kyc_verified = COALESCE($5, kyc_verified)
    WHERE id = $6 
    RETURNING id, name, username, email, role, kyc_verified, created_at;
  `;
  const result = await pool.query(query, [name, username, email, role, kyc_verified, id]);
  return result.rows[0] || null;
};

// UPDATE - Update password
export const updatePassword = async (id, newPassword) => {
  const query = "UPDATE users SET password = $1 WHERE id = $2";
  await pool.query(query, [newPassword, id]);
  return true;
};

// DELETE - Delete user (Renamed function to avoid JS reserved keyword collision)
export const deleteUserRecord = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING id";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
