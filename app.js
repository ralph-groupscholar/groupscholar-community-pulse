const storage = {
  get(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse storage", error);
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const signalForm = document.getElementById("signal-form");
const sentimentInput = document.getElementById("sentiment");
const sentimentDisplay = document.getElementById("sentiment-display");
const seedBtn = document.getElementById("seed-btn");
const signalFeed = document.getElementById("signal-feed");
const digestBtn = document.getElementById("digest-btn");
const digestOutput = document.getElementById("digest-output");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const resetFiltersBtn = document.getElementById("reset-filters");

const metricTotal = document.getElementById("metric-total");
const metricSentiment = document.getElementById("metric-sentiment");
const metricUrgent = document.getElementById("metric-urgent");
const metricWeek = document.getElementById("metric-week");
const metricTag = document.getElementById("metric-tag");
const momentumVolume = document.getElementById("momentum-volume");
const momentumSentiment = document.getElementById("momentum-sentiment");
const momentumUrgency = document.getElementById("momentum-urgency");
const sourceMix = document.getElementById("source-mix");

const searchInput = document.getElementById("search");
const filterSource = document.getElementById("filter-source");
const filterUrgency = document.getElementById("filter-urgency");
const filterSentiment = document.getElementById("filter-sentiment");
const filterTag = document.getElementById("filter-tag");

const trackerForm = document.getElementById("tracker-form");
const trackerGrid = document.getElementById("tracker-grid");

const SIGNAL_KEY = "gs-community-pulse-signals";
const TRACKER_KEY = "gs-community-pulse-commitments";

const sentimentLabels = {
  1: "Critical",
  2: "Concerning",
  3: "Neutral",
  4: "Positive",
  5: "Celebratory"
};

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

function getSignals() {
  return storage.get(SIGNAL_KEY, []);
}

function saveSignals(signals) {
  storage.set(SIGNAL_KEY, signals);
  updateSourceFilter(signals);
  renderAll();
}

function getCommitments() {
  return storage.get(TRACKER_KEY, []);
}

function saveCommitments(commitments) {
  storage.set(TRACKER_KEY, commitments);
  renderCommitments(commitments);
}

function updateSentimentDisplay(value) {
  const label = sentimentLabels[value] || "Neutral";
  sentimentDisplay.textContent = `${value} · ${label}`;
}

function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function isWithinDays(dateString, days) {
  const date = parseDate(dateString);
  const now = new Date();
  const diff = now - date;
  return diff <= days * 24 * 60 * 60 * 1000;
}

function getTopTag(signals) {
  const counts = {};
  signals.forEach((signal) => {
    signal.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  let top = null;
  let topCount = 0;
  Object.entries(counts).forEach(([tag, count]) => {
    if (count > topCount) {
      top = tag;
      topCount = count;
    }
  });
  return top ? `${top} (${topCount})` : "—";
}

function applyFilters(signals) {
  const query = searchInput.value.trim().toLowerCase();
  const source = filterSource.value;
  const urgency = filterUrgency.value;
  const minSentiment = Number(filterSentiment.value || 1);
  const tag = filterTag.value.trim().toLowerCase();

  return signals.filter((signal) => {
    const matchesQuery =
      !query ||
      signal.title.toLowerCase().includes(query) ||
      signal.notes.toLowerCase().includes(query);
    const matchesSource = source === "all" || signal.source === source;
    const matchesUrgency = urgency === "all" || signal.urgency === urgency;
    const matchesSentiment = signal.sentiment >= minSentiment;
    const matchesTag =
      !tag || signal.tags.some((item) => item.toLowerCase().includes(tag));

    return (
      matchesQuery &&
      matchesSource &&
      matchesUrgency &&
      matchesSentiment &&
      matchesTag
    );
  });
}

function updateMetrics(signals) {
  const total = signals.length;
  const avg = total
    ? (
        signals.reduce((sum, signal) => sum + signal.sentiment, 0) / total
      ).toFixed(1)
    : "0.0";
  const urgent = signals.filter((signal) => signal.urgency === "high").length;
  const weekCount = signals.filter((signal) => isWithinDays(signal.createdAt, 7))
    .length;

  metricTotal.textContent = total;
  metricSentiment.textContent = avg;
  metricUrgent.textContent = urgent;
  metricWeek.textContent = weekCount;
  metricTag.textContent = getTopTag(signals);
}

function renderSignalCard(signal) {
  const card = document.createElement("article");
  card.className = "card";

  const badges = document.createElement("div");
  badges.className = "badges";

  const sentimentBadge = document.createElement("span");
  sentimentBadge.className =
    signal.sentiment >= 4 ? "badge positive" : "badge";
  sentimentBadge.textContent = `${signal.sentiment} · ${
    sentimentLabels[signal.sentiment]
  }`;

  const urgencyBadge = document.createElement("span");
  urgencyBadge.className =
    signal.urgency === "high" ? "badge urgent" : "badge";
  urgencyBadge.textContent = `${signal.urgency.toUpperCase()} urgency`;

  const sourceBadge = document.createElement("span");
  sourceBadge.className = "badge";
  sourceBadge.textContent = signal.source;

  badges.append(sentimentBadge, urgencyBadge, sourceBadge);

  const tagWrap = document.createElement("div");
  tagWrap.className = "badges";
  signal.tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.className = "badge";
    tagEl.textContent = `#${tag}`;
    tagWrap.appendChild(tagEl);
  });

  const meta = document.createElement("p");
  meta.textContent = `${signal.location || "Remote"} · ${signal.createdAt}`;

  card.innerHTML = `
    <h4>${signal.title}</h4>
    <p>${signal.notes}</p>
  `;

  card.appendChild(meta);
  card.appendChild(badges);
  card.appendChild(tagWrap);

  return card;
}

function renderFeed(signals) {
  signalFeed.innerHTML = "";
  if (!signals.length) {
    signalFeed.innerHTML = "<p>No signals match your filters yet.</p>";
    return;
  }
  signals.forEach((signal) => {
    signalFeed.appendChild(renderSignalCard(signal));
  });
}

function updateSourceFilter(signals) {
  const sources = Array.from(new Set(signals.map((signal) => signal.source)));
  const current = filterSource.value;
  filterSource.innerHTML = '<option value="all">All sources</option>';
  sources.sort().forEach((source) => {
    const option = document.createElement("option");
    option.value = source;
    option.textContent = source;
    filterSource.appendChild(option);
  });
  if (sources.includes(current)) {
    filterSource.value = current;
  }
}

function renderDigest(signals) {
  const recent = signals.filter((signal) => isWithinDays(signal.createdAt, 7));
  if (!recent.length) {
    digestOutput.innerHTML = "<p>No signals in the last 7 days.</p>";
    return;
  }

  const urgent = recent.filter((signal) => signal.urgency === "high");
  const averageSentiment = (
    recent.reduce((sum, signal) => sum + signal.sentiment, 0) / recent.length
  ).toFixed(1);

  const topTags = getTopTag(recent);

  digestOutput.innerHTML = `
    <p><strong>${recent.length}</strong> signals logged in the last 7 days.</p>
    <p><strong>Average sentiment:</strong> ${averageSentiment}</p>
    <p><strong>Urgent signals:</strong> ${urgent.length}</p>
    <p><strong>Top tag:</strong> ${topTags}</p>
    <ul>
      ${recent
        .slice(0, 3)
        .map((signal) => `<li>${signal.title} (${signal.source})</li>`)
        .join("")}
    </ul>
  `;
}

function renderCommitments(commitments) {
  trackerGrid.innerHTML = "";
  if (!commitments.length) {
    trackerGrid.innerHTML = "<p>No commitments logged yet.</p>";
    return;
  }

  commitments.forEach((item) => {
    const card = document.createElement("div");
    card.className = "tracker-card";

    const header = document.createElement("div");
    header.className = "tracker-meta";

    const statusSelect = document.createElement("select");
    ["Planning", "In progress", "Blocked", "Complete"].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (status === item.status) {
        option.selected = true;
      }
      statusSelect.appendChild(option);
    });
    statusSelect.addEventListener("change", () => {
      item.status = statusSelect.value;
      saveCommitments(commitments);
    });

    header.innerHTML = `<span>${item.owner}</span><span>Due ${item.due}</span>`;

    card.innerHTML = `
      <strong>${item.commitment}</strong>
    `;
    card.appendChild(header);
    card.appendChild(statusSelect);

    trackerGrid.appendChild(card);
  });
}

function renderAll() {
  const signals = getSignals();
  const filtered = applyFilters(signals);
  updateMetrics(signals);
  renderFeed(filtered);
}

function handleSignalSubmit(event) {
  event.preventDefault();
  const formData = new FormData(signalForm);
  const newSignal = {
    id: `signal-${Date.now()}`,
    title: formData.get("title").toString().trim(),
    source: formData.get("source").toString(),
    notes: formData.get("notes").toString().trim(),
    sentiment: Number(formData.get("sentiment")),
    urgency: formData.get("urgency").toString(),
    location: formData.get("location").toString().trim(),
    tags: formData
      .get("tags")
      .toString()
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const signals = [newSignal, ...getSignals()];
  saveSignals(signals);
  signalForm.reset();
  sentimentInput.value = "3";
  updateSentimentDisplay(3);
}

function handleCommitmentSubmit(event) {
  event.preventDefault();
  const formData = new FormData(trackerForm);
  const commitment = {
    id: `commitment-${Date.now()}`,
    commitment: formData.get("commitment").toString().trim(),
    owner: formData.get("owner").toString().trim(),
    due: formData.get("due").toString(),
    status: formData.get("status").toString(),
    createdAt: new Date().toISOString().slice(0, 10)
  };
  const commitments = [commitment, ...getCommitments()];
  saveCommitments(commitments);
  trackerForm.reset();
}

function handleSeed() {
  const signals = getSignals();
  const mergedSignals = [...sampleSignals, ...signals];
  const uniqueSignals = Array.from(
    new Map(mergedSignals.map((item) => [item.id, item])).values()
  );
  saveSignals(uniqueSignals);

  const commitments = getCommitments();
  const mergedCommitments = [...sampleCommitments, ...commitments];
  const uniqueCommitments = Array.from(
    new Map(mergedCommitments.map((item) => [item.id, item])).values()
  );
  saveCommitments(uniqueCommitments);
}

function handleExport() {
  const payload = {
    generatedAt: new Date().toISOString(),
    signals: getSignals(),
    commitments: getCommitments()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "community-pulse-export.json";
  link.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const signals = Array.isArray(parsed.signals) ? parsed.signals : [];
      const commitments = Array.isArray(parsed.commitments)
        ? parsed.commitments
        : [];
      if (signals.length) {
        saveSignals(signals);
      }
      if (commitments.length) {
        saveCommitments(commitments);
      }
    } catch (error) {
      console.error("Failed to import JSON", error);
    }
  };
  reader.readAsText(file);
}

function handleResetFilters() {
  searchInput.value = "";
  filterSource.value = "all";
  filterUrgency.value = "all";
  filterSentiment.value = "1";
  filterTag.value = "";
  renderAll();
}

sentimentInput.addEventListener("input", (event) => {
  updateSentimentDisplay(event.target.value);
});

signalForm.addEventListener("submit", handleSignalSubmit);
trackerForm.addEventListener("submit", handleCommitmentSubmit);
seedBtn.addEventListener("click", handleSeed);
digestBtn.addEventListener("click", () => renderDigest(getSignals()));
exportBtn.addEventListener("click", handleExport);
importInput.addEventListener("change", handleImport);
resetFiltersBtn.addEventListener("click", handleResetFilters);

[searchInput, filterSource, filterUrgency, filterSentiment, filterTag].forEach(
  (input) => input.addEventListener("input", renderAll)
);

function init() {
  updateSentimentDisplay(sentimentInput.value);
  updateSourceFilter(getSignals());
  renderAll();
  renderCommitments(getCommitments());
}

init();
