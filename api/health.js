const { query } = require("./_db");
const { sendJson } = require("./_utils");

module.exports = async (req, res) => {
  try {
    await query("SELECT 1");
    sendJson(res, 200, {
      ok: true,
      mode: "cloud",
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error.message
    });
  }
};
