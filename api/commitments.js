const { query } = require("./_db");
const { readJson, sendJson } = require("./_utils");

const SCHEMA = "groupscholar_community_pulse";

function normalizeCommitment(commitment) {
  return {
    id: String(commitment.id || ""),
    commitment: String(commitment.commitment || "").trim(),
    owner: String(commitment.owner || "").trim(),
    due: String(commitment.due || "").slice(0, 10),
    status: String(commitment.status || "").trim(),
    createdAt: String(commitment.createdAt || "").slice(0, 10)
  };
}

async function listCommitments() {
  const { rows } = await query(
    `SELECT id, commitment, owner, due, status, created_at
     FROM ${SCHEMA}.commitments
     ORDER BY created_at DESC, inserted_at DESC`
  );
  return rows.map((row) => ({
    id: row.id,
    commitment: row.commitment,
    owner: row.owner,
    due: row.due,
    status: row.status,
    createdAt: row.created_at
  }));
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const commitments = await listCommitments();
      return sendJson(res, 200, { commitments });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const payload = await readJson(req);
      const commitment = normalizeCommitment(payload);
      if (!commitment.id || !commitment.commitment || !commitment.owner) {
        return sendJson(res, 400, { error: "Missing required fields." });
      }
      await query(
        `INSERT INTO ${SCHEMA}.commitments
          (id, commitment, owner, due, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          commitment.id,
          commitment.commitment,
          commitment.owner,
          commitment.due,
          commitment.status,
          commitment.createdAt
        ]
      );
      const commitments = await listCommitments();
      return sendJson(res, 200, { commitments });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const payload = await readJson(req);
      const id = String(payload.id || "");
      const status = String(payload.status || "").trim();
      if (!id || !status) {
        return sendJson(res, 400, { error: "Missing required fields." });
      }
      await query(
        `UPDATE ${SCHEMA}.commitments
         SET status = $1
         WHERE id = $2`,
        [status, id]
      );
      const commitments = await listCommitments();
      return sendJson(res, 200, { commitments });
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  sendJson(res, 405, { error: "Method not allowed." });
};
