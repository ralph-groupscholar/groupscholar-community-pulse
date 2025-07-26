const { query } = require("./_db");
const { readJson, sendJson } = require("./_utils");

const SCHEMA = "groupscholar_community_pulse";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const payload = await readJson(req);
    const signals = Array.isArray(payload.signals) ? payload.signals : [];
    const commitments = Array.isArray(payload.commitments)
      ? payload.commitments
      : [];

    for (const signal of signals) {
      if (!signal || !signal.id) continue;
      await query(
        `INSERT INTO ${SCHEMA}.signals
          (id, title, source, notes, sentiment, urgency, location, tags, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          signal.id,
          signal.title || "",
          signal.source || "",
          signal.notes || "",
          Number(signal.sentiment || 0),
          signal.urgency || "",
          signal.location || "",
          Array.isArray(signal.tags) ? signal.tags : [],
          String(signal.createdAt || "").slice(0, 10)
        ]
      );
    }

    for (const commitment of commitments) {
      if (!commitment || !commitment.id) continue;
      await query(
        `INSERT INTO ${SCHEMA}.commitments
          (id, commitment, owner, due, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          commitment.id,
          commitment.commitment || "",
          commitment.owner || "",
          String(commitment.due || "").slice(0, 10),
          commitment.status || "",
          String(commitment.createdAt || "").slice(0, 10)
        ]
      );
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
