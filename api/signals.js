const { query } = require("./_db");
const { readJson, sendJson } = require("./_utils");

const SCHEMA = "groupscholar_community_pulse";

function normalizeSignal(signal) {
  return {
    id: String(signal.id || ""),
    title: String(signal.title || "").trim(),
    source: String(signal.source || "").trim(),
    notes: String(signal.notes || "").trim(),
    sentiment: Number(signal.sentiment || 0),
    urgency: String(signal.urgency || "").trim(),
    location: signal.location ? String(signal.location).trim() : "",
    tags: Array.isArray(signal.tags)
      ? signal.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    createdAt: String(signal.createdAt || "").slice(0, 10)
  };
}

async function listSignals() {
  const { rows } = await query(
    `SELECT id, title, source, notes, sentiment, urgency, location, tags, created_at
     FROM ${SCHEMA}.signals
     ORDER BY created_at DESC, inserted_at DESC`
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    source: row.source,
    notes: row.notes,
    sentiment: row.sentiment,
    urgency: row.urgency,
    location: row.location || "",
    tags: row.tags || [],
    createdAt: row.created_at
  }));
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const signals = await listSignals();
      return sendJson(res, 200, { signals });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const payload = await readJson(req);
      const signal = normalizeSignal(payload);
      if (!signal.id || !signal.title || !signal.source || !signal.notes) {
        return sendJson(res, 400, { error: "Missing required fields." });
      }
      await query(
        `INSERT INTO ${SCHEMA}.signals
          (id, title, source, notes, sentiment, urgency, location, tags, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          signal.id,
          signal.title,
          signal.source,
          signal.notes,
          signal.sentiment,
          signal.urgency,
          signal.location,
          signal.tags,
          signal.createdAt
        ]
      );
      const signals = await listSignals();
      return sendJson(res, 200, { signals });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  sendJson(res, 405, { error: "Method not allowed." });
};
