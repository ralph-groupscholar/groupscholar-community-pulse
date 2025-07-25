const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: false
});

const schema = "groupscholar_community_pulse";
const table = "signals";

const sampleSignals = [
  {
    id: "signal-1",
    title: "Stipend disbursement timing slipping",
    source: "Scholar",
    notes: "Several scholars noted delays in January disbursement and stress about rent.",
    sentiment: 2,
    urgency: "high",
    location: "Detroit, MI",
    tags: ["financial", "stipend", "wellbeing"],
    createdAt: "2026-02-04"
  },
  {
    id: "signal-2",
    title: "Peer pod attendance climbing",
    source: "Staff",
    notes: "Weekly peer pods hit 82% attendance, higher than fall cohort.",
    sentiment: 5,
    urgency: "low",
    location: "Remote",
    tags: ["belonging", "community"],
    createdAt: "2026-02-02"
  },
  {
    id: "signal-3",
    title: "Mentor onboarding clarity requested",
    source: "Mentor",
    notes: "Mentors want clearer time expectations for check-ins.",
    sentiment: 3,
    urgency: "medium",
    location: "Chicago, IL",
    tags: ["mentorship", "onboarding"],
    createdAt: "2026-01-30"
  },
  {
    id: "signal-4",
    title: "Career clinic waitlist expanding",
    source: "Alumni",
    notes: "Alumni request additional seats for resume clinics.",
    sentiment: 4,
    urgency: "medium",
    location: "Remote",
    tags: ["career", "capacity"],
    createdAt: "2026-01-27"
  }
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.${table} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        notes TEXT NOT NULL,
        sentiment INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        location TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at DATE NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const insertQuery = `
      INSERT INTO ${schema}.${table}
        (id, title, source, notes, sentiment, urgency, location, tags, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        source = EXCLUDED.source,
        notes = EXCLUDED.notes,
        sentiment = EXCLUDED.sentiment,
        urgency = EXCLUDED.urgency,
        location = EXCLUDED.location,
        tags = EXCLUDED.tags,
        created_at = EXCLUDED.created_at,
        updated_at = NOW()
    `;

    for (const signal of sampleSignals) {
      await client.query(insertQuery, [
        signal.id,
        signal.title,
        signal.source,
        signal.notes,
        signal.sentiment,
        signal.urgency,
        signal.location,
        signal.tags,
        signal.createdAt
      ]);
    }

    await client.query("COMMIT");
    console.log("Seeded community pulse signals.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
