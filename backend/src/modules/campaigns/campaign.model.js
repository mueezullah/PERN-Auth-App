import { pool } from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount NUMERIC(15,2) NOT NULL CHECK (goal_amount > 0),
        current_amount NUMERIC(15,2) DEFAULT 0,
        deadline TIMESTAMP NOT NULL,
        media_url VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline);
  `;
  try {
    await pool.query(query);
    console.log("Campaigns table is ready");
  } catch (error) {
    console.error("Error initializing campaigns table:", error);
    throw error;
  }
};

export const create = async (userId, title, description, goalAmount, deadline, mediaUrl) => {
  const query = `
    INSERT INTO campaigns (user_id, title, description, goal_amount, deadline, media_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [userId, title, description, goalAmount, deadline, mediaUrl];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findAllActive = async (limit, offset, status = 'active') => {
  let query = `
      SELECT c.*, u.name as owner_name 
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
    `;
  let countQuery = `SELECT COUNT(*) FROM campaigns`;
  const queryParams = [];
    const countParams = [];

    if (status && status !== 'all') {
      query += ` WHERE c.status = $1`;
      countQuery += ` WHERE status = $1`;
      queryParams.push(status);
      countParams.push(status);

      query += ` ORDER BY c.created_at DESC LIMIT $2 OFFSET $3;`;
      queryParams.push(limit, offset);
    } else {
      query += ` WHERE c.status != 'deleted'`;
      countQuery += ` WHERE status != 'deleted'`;

      query += ` ORDER BY c.created_at DESC LIMIT $1 OFFSET $2;`;
      queryParams.push(limit, offset);
    }

    const result = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, countParams);

    return {
      campaigns: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
};

export const findById = async (id) => {
  const query = `
      SELECT c.*, u.name as owner_name, u.email as owner_email
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND c.status != 'deleted';
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const update = async (id, title, description, goalAmount, deadline, mediaUrl) => {
  const query = `
      UPDATE campaigns
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          goal_amount = COALESCE($3, goal_amount),
          deadline = COALESCE($4, deadline),
          media_url = COALESCE($5, media_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;
    const result = await pool.query(query, [title, description, goalAmount, deadline, mediaUrl, id]);
    return result.rows[0];
};

export const updateExpiredCampaigns = async () => {
  const query = `
      UPDATE campaigns
      SET status = 'ended',
          updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active' AND deadline < CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await pool.query(query);
    return result.rows;
};

export const deleteCampaign = async (id) => {
  const query = `
      UPDATE campaigns
      SET status = 'deleted', current_amount = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};
