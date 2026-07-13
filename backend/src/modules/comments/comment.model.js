import { pool } from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('campaign', 'post')),
      target_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);
  `;
  try {
    await pool.query(query);
    console.log("Comments table is ready");
  } catch (error) {
    console.error("Error initializing comments table:", error);
    throw error;
  }
};

export const create = async (userId, targetType, targetId, content) => {
  const query = `
    INSERT INTO comments (user_id, target_type, target_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [userId, targetType, targetId, content];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findByTarget = async (targetType, targetId, since = null) => {
  let query = `
    SELECT c.*, u.name as author_name, u.username as author_username, u.role as author_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.target_type = $1 AND c.target_id = $2
  `;
  const values = [targetType, targetId];

  if (since) {
    query += ` AND c.created_at > $3`;
    values.push(since);
  }

  query += ` ORDER BY c.created_at ASC, c.id ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

export const countByTarget = async (targetType, targetId) => {
  const query = `
    SELECT COUNT(*) FROM comments
    WHERE target_type = $1 AND target_id = $2;
  `;
  const result = await pool.query(query, [targetType, targetId]);
  return parseInt(result.rows[0].count, 10);
};
