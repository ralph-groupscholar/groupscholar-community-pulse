const { query } = require("./_db");
const { sendJson } = require("./_utils");

const SCHEMA = "groupscholar_community_pulse";

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

const sampleCommitments = [
  {
    id: "commitment-1",
    commitment: "Confirm stipend SLA with finance partners",
    owner: "Finance Ops",
    due: "2026-02-12",
    status: "In progress",
    createdAt: "2026-02-05"
  },
  {
    id: "commitment-2",
    commitment: "Publish mentor time expectations",
    owner: "Mentor Team",
    due: "2026-02-18",
    status: "Planning",
    createdAt: "2026-02-02"
  }
];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    for (const signal of sampleSignals) {
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
    }

    for (const commitment of sampleCommitments) {
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
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
