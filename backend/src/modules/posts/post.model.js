import pool from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      media_url VARCHAR(255),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  `;
  try {
    await pool.query(query);
    console.log("Posts table is ready");
  } catch (error) {
    console.error("Error initializing posts table:", error);
    throw error;
  }
};

export const createPost = async (userId, content, mediaUrl) => {
  const query = `
      INSERT INTO posts (user_id, content, media_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
  const values = [userId, content, mediaUrl];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findAllPosts = async (limit = 10, offset = 0) => {
  const query = `
      SELECT p.*, COUNT(*) OVER() as total_count, u.name as author_name, u.username as author_username, u.email as author_email, u.role as author_role,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'post' AND target_id = p.id) AS comments_count,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) AS likes_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status != 'deleted'
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
  const result = await pool.query(query, [limit, offset]);
  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    posts: result.rows,
    total
  };
};

export const findByUserId = async (userId, limit = 10, offset = 0) => {
  const query = `
      SELECT p.*, COUNT(*) OVER() as total_count, u.name as author_name, u.username as author_username, u.email as author_email,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'post' AND target_id = p.id) AS comments_count,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) AS likes_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 AND p.status != 'deleted'
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
  const result = await pool.query(query, [userId, limit, offset]);

  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;

  return {
    posts: result.rows,
    total
  };
};

export const findById = async (id) => {
  const query = `
      SELECT * FROM posts WHERE id = $1;
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const deletePost = async (id) => {
  const query = `
      UPDATE posts 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const updatePost = async (id, userId, content, mediaUrl) => {
  const query = `
      UPDATE posts
      SET content = COALESCE($1, content),
          media_url = COALESCE($2, media_url),
          status = 'updated',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *;
    `;
  const values = [content, mediaUrl, id, userId];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const findPostWithAuthor = async (id) => {
  const query = `
    SELECT p.*, u.name as author_name, u.username as author_username, u.email as author_email, u.role as author_role,
    (SELECT COUNT(*) FROM comments WHERE target_type = 'post' AND target_id = p.id) AS comments_count,
    (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) AS likes_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1 AND p.status != 'deleted';
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
