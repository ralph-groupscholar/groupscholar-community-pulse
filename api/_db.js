const { Pool } = require("pg");

let pool;

function getPool() {
  if (pool) return pool;
  const connectionString =
    process.env.GS_COMMUNITY_PULSE_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Database connection string is missing.");
  }
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
}

async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

module.exports = { query };
