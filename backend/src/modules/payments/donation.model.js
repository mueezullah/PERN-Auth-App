import pool from "../../config/db.js";

export const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
      stripe_payment_intent_id VARCHAR(255) UNIQUE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
    CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
  `;
  try {
    await pool.query(query);
    console.log("Donations table is ready");
  } catch (error) {
    console.error("Error initializing donations table:", error);
    throw error;
  }
};
