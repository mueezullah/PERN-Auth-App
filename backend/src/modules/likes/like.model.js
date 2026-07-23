import { pool } from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('campaign', 'post')),
      target_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, target_type, target_id)
    );
    CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
  `;
  try {
    await pool.query(query);
    console.log("Likes table is ready");
  } catch (error) {
    console.error("Error initializing likes table:", error);
    throw error;
  }
};

export const toggle = async (userId, targetType, targetId) => {
  const existing = await pool.query(
    `SELECT id FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [userId, targetType, targetId]
  );

  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM likes WHERE id = $1`, [existing.rows[0].id]);
    return { liked: false };
  } else {
    await pool.query(
      `INSERT INTO likes (user_id, target_type, target_id) VALUES ($1, $2, $3)`,
      [userId, targetType, targetId]
    );
    return { liked: true };
  }
};

export const countByTarget = async (targetType, targetId) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2`,
    [targetType, targetId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const hasUserLiked = async (userId, targetType, targetId) => {
  const result = await pool.query(
    `SELECT 1 FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [userId, targetType, targetId]
  );
  return result.rows.length > 0;
};
