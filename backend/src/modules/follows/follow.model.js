import { pool } from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS follows (
      id SERIAL PRIMARY KEY,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
      CONSTRAINT check_no_self_follow CHECK (follower_id <> following_id)
    );

    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
  `;
  try {
    await pool.query(query);
    console.log("Follows table initialized successfully");
  } catch (error) {
    console.error("Error initializing follows table:", error);
    throw error;
  }
};

// Toggle follow/unfollow status
export const toggleFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await pool.query(
    `SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );

  if (existing.rows.length > 0) {
    await pool.query(`DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`, [followerId, followingId]);
    return { isFollowing: false };
  } else {
    await pool.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
      [followerId, followingId]
    );
    return { isFollowing: true };
  }
};

// Check if a specific user follows target user
export const checkIsFollowing = async (followerId, followingId) => {
  const result = await pool.query(
    `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return result.rows.length > 0;
};

// Get follower count & following count for a user profile
export const getFollowCounts = async (userId) => {
  const followerRes = await pool.query(
    `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
    [userId]
  );
  const followingRes = await pool.query(
    `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
    [userId]
  );

  return {
    followersCount: parseInt(followerRes.rows[0].count, 10),
    followingCount: parseInt(followingRes.rows[0].count, 10),
  };
};

// Get list of users following a user
export const getFollowers = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.profile_picture, f.created_at
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Get list of users a user is following
export const getFollowing = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.profile_picture, f.created_at
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};
