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
const healthSummary = document.getElementById("health-summary");
const healthRows = document.getElementById("health-rows");
const alertList = document.getElementById("alert-list");
const triageGrid = document.getElementById("triage-grid");
const playbookOutput = document.getElementById("playbook-output");
const tagGrid = document.getElementById("tag-grid");
const tagInsights = document.getElementById("tag-insights");

const searchInput = document.getElementById("search");
const filterSource = document.getElementById("filter-source");
const filterUrgency = document.getElementById("filter-urgency");
const filterSentiment = document.getElementById("filter-sentiment");
const filterTag = document.getElementById("filter-tag");

const trackerForm = document.getElementById("tracker-form");
const trackerGrid = document.getElementById("tracker-grid");
const commitmentOverdue = document.getElementById("commitment-overdue");
const commitmentDueSoon = document.getElementById("commitment-due-soon");
const commitmentBlocked = document.getElementById("commitment-blocked");
const commitmentCompletion = document.getElementById("commitment-completion");
const commitmentStatusBars = document.getElementById("commitment-status-bars");
const commitmentOwnerRows = document.getElementById("commitment-owner-rows");
const commitmentUpcoming = document.getElementById("commitment-upcoming");
const linkedSignalIdInput = document.getElementById("linked-signal-id");
const linkedSignalText = document.getElementById("commitment-link-text");
const clearLinkBtn = document.getElementById("clear-link");
const commitmentOverdue = document.getElementById("commitment-overdue");
const commitmentDueSoon = document.getElementById("commitment-due-soon");
const commitmentBlocked = document.getElementById("commitment-blocked");
const commitmentCompletion = document.getElementById("commitment-completion");
const commitmentStatusBars = document.getElementById("commitment-status-bars");
const commitmentOwnerRows = document.getElementById("commitment-owner-rows");
const commitmentUpcoming = document.getElementById("commitment-upcoming");

const dataModeStatus = document.getElementById("data-mode-status");
const dataModeDetail = document.getElementById("data-mode-detail");
const dataModeToggle = document.getElementById("data-mode-toggle");
const dataRefreshBtn = document.getElementById("data-refresh");
const dataFooter = document.getElementById("data-footer");

const SIGNAL_KEY = "gs-community-pulse-signals";
const TRACKER_KEY = "gs-community-pulse-commitments";
const MODE_KEY = "gs-community-pulse-mode";

const sentimentLabels = {
  1: "Critical",
  2: "Concerning",
  3: "Neutral",
  4: "Positive",
  5: "Celebratory"
};

const defaultSources = [
  "Scholar",
  "Partner",
  "Mentor",
  "Staff",
  "Ambassador",
  "Community Event"
];

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
    signalId: "signal-1",
    createdAt: "2026-02-05"
  },
  {
    id: "commitment-2",
    commitment: "Publish mentor time expectations",
    owner: "Mentor Team",
    due: "2026-02-18",
    status: "Planning",
    signalId: "signal-3",
    createdAt: "2026-02-02"
  }
];

let signalStore = storage.get(SIGNAL_KEY, []);
let commitmentStore = storage.get(TRACKER_KEY, []);
let remoteAvailable = false;
let dataMode = "local";
let lastSync = null;
let modePreference = storage.get(MODE_KEY, "auto");

function setSignals(signals, persist = true) {
  signalStore = signals;
  if (persist) {
    storage.set(SIGNAL_KEY, signals);
  }
  updateSourceFilter(signals);
  renderAll();
}

function setCommitments(commitments, persist = true) {
  commitmentStore = commitments;
  if (persist) {
    storage.set(TRACKER_KEY, commitments);
  }
  renderCommitments(commitments);
  renderCommitmentPulse(commitments);
}

function getSignals() {
  return signalStore;
}

function getCommitments() {
  return commitmentStore;
}

function setLinkedSignal(signal) {
  if (!linkedSignalIdInput || !linkedSignalText) return;
  if (signal) {
    linkedSignalIdInput.value = signal.id;
    linkedSignalText.textContent = `${signal.title} · ${signal.source}`;
    return;
  }
  linkedSignalIdInput.value = "";
  linkedSignalText.textContent = "None linked";
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function renderCommitmentPulse(commitments) {
  if (!commitmentOverdue) return;

  const total = commitments.length;
  const today = startOfToday();
  const active = commitments.filter((item) => item.status !== "Complete");

  const overdue = active.filter((item) => parseDate(item.due) < today);
  const dueSoon = active.filter((item) => {
    const diff = parseDate(item.due) - today;
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });
  const blocked = commitments.filter((item) => item.status === "Blocked");
  const completeCount = commitments.filter((item) => item.status === "Complete");
  const completionRate = total ? (completeCount.length / total) * 100 : 0;

  commitmentOverdue.textContent = overdue.length;
  commitmentDueSoon.textContent = dueSoon.length;
  commitmentBlocked.textContent = blocked.length;
  commitmentCompletion.textContent = formatPercent(completionRate);

  const statusOrder = [
    { label: "Planning", className: "" },
    { label: "In progress", className: "progress" },
    { label: "Blocked", className: "blocked" },
    { label: "Complete", className: "" }
  ];

  commitmentStatusBars.innerHTML = "";
  if (!total) {
    commitmentStatusBars.innerHTML = "<p>No commitments yet.</p>";
  } else {
    statusOrder.forEach((status) => {
      const count = commitments.filter((item) => item.status === status.label).length;
      const percent = (count / total) * 100;
      const bar = document.createElement("div");
      bar.className = "commitment-bar";
      bar.innerHTML = `
        <div>
          <strong>${status.label}</strong>
          <span>${count} items</span>
        </div>
        <div class="commitment-bar-track">
          <div class="commitment-bar-fill ${status.className}" style="width: ${percent}%"></div>
        </div>
      `;
      commitmentStatusBars.appendChild(bar);
    });
  }

  commitmentOwnerRows.innerHTML = "";
  if (!active.length) {
    commitmentOwnerRows.innerHTML = "<p>No active owners yet.</p>";
  } else {
    const ownerMap = active.reduce((acc, item) => {
      const owner = item.owner || "Unassigned";
      if (!acc[owner]) acc[owner] = [];
      acc[owner].push(item);
      return acc;
    }, {});

    Object.entries(ownerMap)
      .map(([owner, items]) => ({
        owner,
        count: items.length,
        nextDue: items
          .map((item) => item.due)
          .sort((a, b) => parseDate(a) - parseDate(b))[0]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .forEach((entry) => {
        const row = document.createElement("div");
        row.className = "owner-row";
        row.innerHTML = `<span>${entry.owner}</span><span>${entry.count} · next ${entry.nextDue}</span>`;
        commitmentOwnerRows.appendChild(row);
      });
  }

  commitmentUpcoming.innerHTML = "";
  const upcoming = active
    .slice()
    .sort((a, b) => parseDate(a.due) - parseDate(b.due))
    .slice(0, 3);
  if (!upcoming.length) {
    commitmentUpcoming.innerHTML = "<li>All caught up.</li>";
  } else {
    upcoming.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.commitment}</strong><span>${item.owner} · due ${item.due}</span>`;
      commitmentUpcoming.appendChild(li);
    });
  }
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

function getDaysAgo(dateString) {
  const date = parseDate(dateString);
  const now = new Date();
  const diff = now - date;
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

function getSignalsInRange(signals, startDaysAgoExclusive, endDaysAgoInclusive) {
  return signals.filter((signal) => {
    const daysAgo = getDaysAgo(signal.createdAt);
    return (
      daysAgo > startDaysAgoExclusive && daysAgo <= endDaysAgoInclusive
    );
  });
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

function formatDelta(value, suffix) {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

function updateMomentum(signals) {
  if (!signals.length) {
    momentumVolume.textContent = "0%";
    momentumSentiment.textContent = "0.0";
    momentumUrgency.textContent = "0%";
    sourceMix.innerHTML = "<p>No signal sources yet.</p>";
    return;
  }

  const recent = getSignalsInRange(signals, -1, 7);
  const prior = getSignalsInRange(signals, 7, 14);

  const volumeDelta = prior.length
    ? Math.round(((recent.length - prior.length) / prior.length) * 100)
    : recent.length
      ? null
      : 0;

  const recentAvg = recent.length
    ? recent.reduce((sum, signal) => sum + signal.sentiment, 0) / recent.length
    : null;
  const priorAvg = prior.length
    ? prior.reduce((sum, signal) => sum + signal.sentiment, 0) / prior.length
    : null;

  const sentimentDelta =
    recentAvg !== null && priorAvg !== null
      ? Number((recentAvg - priorAvg).toFixed(1))
      : null;

  const recentUrgentShare = recent.length
    ? recent.filter((signal) => signal.urgency === "high").length / recent.length
    : null;
  const priorUrgentShare = prior.length
    ? prior.filter((signal) => signal.urgency === "high").length / prior.length
    : null;

  const urgencyDelta =
    recentUrgentShare !== null && priorUrgentShare !== null
      ? Math.round((recentUrgentShare - priorUrgentShare) * 100)
      : null;

  momentumVolume.textContent =
    volumeDelta === null ? "New" : formatDelta(volumeDelta, "%");
  momentumSentiment.textContent = formatDelta(sentimentDelta, "");
  momentumUrgency.textContent = formatDelta(urgencyDelta, "%");

  const windowSignals = signals.filter((signal) =>
    isWithinDays(signal.createdAt, 14)
  );
  if (!windowSignals.length) {
    sourceMix.innerHTML = "<p class=\"hint\">No recent source mix yet.</p>";
    return;
  }

  const counts = windowSignals.reduce((acc, signal) => {
    acc[signal.source] = (acc[signal.source] || 0) + 1;
    return acc;
  }, {});

  const total = windowSignals.length || 1;
  const sources = Array.from(
    new Set([...defaultSources, ...Object.keys(counts)])
  );
  sourceMix.innerHTML = "";
  sources
    .filter((source) => counts[source])
    .sort((a, b) => counts[b] - counts[a])
    .forEach((source) => {
      const count = counts[source];
      const percentage = Math.round((count / total) * 100);
      const bar = document.createElement("div");
      bar.className = "mini-bar";
      bar.innerHTML = `
        <div>${source}</div>
        <span style="--fill: ${percentage}%"></span>
        <strong>${percentage}%</strong>
      `;
      sourceMix.appendChild(bar);
    });
}

function getSourceStats(signals) {
  const sources = Array.from(
    new Set([...defaultSources, ...signals.map((signal) => signal.source)])
  );
  return sources.map((source) => {
    const items = signals.filter((signal) => signal.source === source);
    const total = items.length;
    const lastDate = total
      ? items.reduce(
          (latest, signal) =>
            parseDate(signal.createdAt) > parseDate(latest)
              ? signal.createdAt
              : latest,
          items[0].createdAt
        )
      : null;
    const lastDays = lastDate ? getDaysAgo(lastDate) : null;
    const last14 = items.filter((signal) => isWithinDays(signal.createdAt, 14))
      .length;
    const urgent14 = items.filter(
      (signal) =>
        signal.urgency === "high" && isWithinDays(signal.createdAt, 14)
    ).length;
    const avgSentiment = total
      ? (
          items.reduce((sum, signal) => sum + signal.sentiment, 0) / total
        ).toFixed(1)
      : "—";
    let status = "No data";
    if (total) {
      if (lastDays <= 7) status = "Active";
      else if (lastDays <= 14) status = "Fading";
      else status = "Silent";
    }
    return {
      source,
      total,
      lastDate,
      lastDays,
      last14,
      urgent14,
      avgSentiment,
      status
    };
  });
}

function renderListeningHealth(signals) {
  const stats = getSourceStats(signals);
  const activeCount = stats.filter((item) => item.last14 > 0).length;
  const silentCount = stats.filter((item) => item.status === "Silent").length;
  const fadingCount = stats.filter((item) => item.status === "Fading").length;
  const topUrgent = stats
    .filter((item) => item.last14 > 0)
    .sort((a, b) => b.urgent14 - a.urgent14)[0];

  healthSummary.innerHTML = `
    <div class="summary-card">
      <span class="label">Active channels</span>
      <strong>${activeCount}/${stats.length}</strong>
    </div>
    <div class="summary-card">
      <span class="label">Fading signals</span>
      <strong>${fadingCount}</strong>
    </div>
    <div class="summary-card">
      <span class="label">Silent channels</span>
      <strong>${silentCount}</strong>
    </div>
    <div class="summary-card">
      <span class="label">Urgency hotspot</span>
      <strong>${topUrgent ? topUrgent.source : "—"}</strong>
    </div>
  `;

  healthRows.innerHTML = "";
  stats
    .sort((a, b) => b.last14 - a.last14)
    .forEach((item) => {
      const row = document.createElement("div");
      row.className = "health-row";
      const statusClass =
        item.status === "Active"
          ? "status-active"
          : item.status === "Fading"
            ? "status-fading"
            : item.status === "Silent"
              ? "status-silent"
              : "status-empty";
      row.innerHTML = `
        <span>${item.source}</span>
        <span>${item.lastDate ? `${item.lastDate} (${item.lastDays}d)` : "—"}</span>
        <span>${item.last14}</span>
        <span>${item.avgSentiment}</span>
        <span class="status-badge ${statusClass}">${item.status}</span>
      `;
      healthRows.appendChild(row);
    });

  renderAlertDesk(stats);
}

function renderAlertDesk(stats) {
  const alerts = [];
  stats.forEach((item) => {
    if (!item.total) {
      alerts.push({
        tone: "low",
        text: `No signals logged yet for ${item.source}.`
      });
      return;
    }
    if (item.status === "Silent") {
      alerts.push({
        tone: "high",
        text: `No recent signals from ${item.source} in ${item.lastDays} days.`
      });
    } else if (item.status === "Fading") {
      alerts.push({
        tone: "medium",
        text: `Signals are slowing in ${item.source} (last seen ${item.lastDays} days ago).`
      });
    }
    if (item.last14 >= 3) {
      const urgencyRatio = item.urgent14 / item.last14;
      if (urgencyRatio >= 0.4) {
        alerts.push({
          tone: "high",
          text: `Elevated urgency in ${item.source} (${Math.round(
            urgencyRatio * 100
          )}% high).`
        });
      }
    }
    if (item.avgSentiment !== "—" && Number(item.avgSentiment) <= 2.5) {
      alerts.push({
        tone: "medium",
        text: `Sentiment concern in ${item.source} (avg ${item.avgSentiment}).`
      });
    }
  });

  alertList.innerHTML = "";
  if (!alerts.length) {
    alertList.innerHTML = "<li>All clear. No anomalies detected.</li>";
    return;
  }
  alerts
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.tone] - order[b.tone];
    })
    .forEach((alert) => {
      const item = document.createElement("li");
      if (alert.tone === "high") {
        item.className = "alert-high";
      }
      item.textContent = alert.text;
      alertList.appendChild(item);
    });
}

function getRecentSignals(signals, days) {
  return signals.filter((signal) => isWithinDays(signal.createdAt, days));
}

function classifySignal(signal) {
  if (signal.urgency === "high" || signal.sentiment <= 2) {
    return {
      lane: "Escalate",
      reason:
        signal.urgency === "high"
          ? "High urgency"
          : "Low sentiment trigger"
    };
  }
  if (signal.urgency === "medium" || signal.sentiment === 3) {
    return { lane: "Act", reason: "Needs follow-up" };
  }
  return { lane: "Listen", reason: "Monitor pulse" };
}

function renderTriage(signals) {
  const recent = getRecentSignals(signals, 7);
  triageGrid.innerHTML = "";
  if (!recent.length) {
    triageGrid.innerHTML = "<p>No recent signals to triage yet.</p>";
    return;
  }

  const lanes = {
    Escalate: [],
    Act: [],
    Listen: []
  };

  recent.forEach((signal) => {
    const classification = classifySignal(signal);
    lanes[classification.lane].push({ signal, ...classification });
  });

  Object.entries(lanes).forEach(([lane, items]) => {
    const column = document.createElement("div");
    column.className = "triage-column";

    const header = document.createElement("div");
    header.className = "triage-head";
    header.innerHTML = `<h3>${lane}</h3><span>${items.length} signals</span>`;
    column.appendChild(header);

    const stack = document.createElement("div");
    stack.className = "triage-stack";
    if (!items.length) {
      stack.innerHTML = "<p class=\"hint\">No signals in this lane.</p>";
    } else {
      items
        .sort((a, b) => parseDate(b.signal.createdAt) - parseDate(a.signal.createdAt))
        .forEach((item) => {
          const card = document.createElement("div");
          card.className = "triage-card";
          card.innerHTML = `
            <h4>${item.signal.title}</h4>
            <p>${item.signal.notes}</p>
            <div class="triage-meta">
              <span>${item.signal.source}</span>
              <span>${item.signal.createdAt}</span>
              <span>${item.signal.urgency.toUpperCase()}</span>
            </div>
            <span class="triage-reason">${item.reason}</span>
          `;
          stack.appendChild(card);
        });
    }
    column.appendChild(stack);
    triageGrid.appendChild(column);
  });
}

function renderPlaybook(signals) {
  const recent = getRecentSignals(signals, 7);
  if (!recent.length) {
    playbookOutput.innerHTML = "<p>No playbook generated yet.</p>";
    return;
  }

  const urgent = recent.filter((signal) => signal.urgency === "high");
  const lowSentiment = recent.filter((signal) => signal.sentiment <= 2);
  const topTag = getTopTag(recent);
  const sourceCounts = recent.reduce((acc, signal) => {
    acc[signal.source] = (acc[signal.source] || 0) + 1;
    return acc;
  }, {});
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
  const stats = getSourceStats(signals);
  const silentSource = stats.find((item) => item.status === "Silent");

  const actions = [];
  if (urgent.length) {
    actions.push(
      `Assign owners to ${urgent.length} urgent signals within 48 hours and log commitments.`
    );
  }
  if (lowSentiment.length) {
    actions.push(
      `Run listening follow-ups for ${lowSentiment.length} low-sentiment signals, starting with ${topSource ? topSource[0] : "priority channels"}.`
    );
  }
  if (topTag !== "—") {
    actions.push(
      `Align next week’s outreach around the ${topTag} theme and track sentiment shifts.`
    );
  }
  if (silentSource) {
    actions.push(
      `Re-open the ${silentSource.source} listening post with a targeted check-in or survey.`
    );
  }
  if (!actions.length) {
    actions.push("Maintain current cadence and keep logging signals daily.");
  }

  playbookOutput.innerHTML = `
    <ul>
      ${actions.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function getTagStats(signals) {
  const stats = {};
  signals.forEach((signal) => {
    signal.tags.forEach((tag) => {
      if (!stats[tag]) {
        stats[tag] = { tag, count: 0, sentimentTotal: 0, urgent: 0 };
      }
      stats[tag].count += 1;
      stats[tag].sentimentTotal += signal.sentiment;
      if (signal.urgency === "high") {
        stats[tag].urgent += 1;
      }
    });
  });
  return Object.values(stats).map((item) => ({
    ...item,
    avgSentiment: item.count
      ? (item.sentimentTotal / item.count).toFixed(1)
      : "—",
    urgentShare: item.count
      ? Math.round((item.urgent / item.count) * 100)
      : 0
  }));
}

function renderTagTrends(signals) {
  if (!tagGrid || !tagInsights) return;

  const recent14 = getRecentSignals(signals, 14);
  if (!recent14.length) {
    tagGrid.innerHTML = "<p class=\"hint\">No recent tag activity yet.</p>";
    tagInsights.innerHTML = "";
    return;
  }

  const topTags = getTagStats(recent14)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  tagGrid.innerHTML = "";
  if (!topTags.length) {
    tagGrid.innerHTML = "<p class=\"hint\">Tags haven’t been added to recent signals.</p>";
    tagInsights.innerHTML = "";
    return;
  }
  topTags.forEach((item) => {
    const card = document.createElement("div");
    card.className = "tag-card";
    card.innerHTML = `
      <h4>#${item.tag}</h4>
      <p><strong>${item.count}</strong> signals · Avg sentiment ${item.avgSentiment}</p>
      <div class="tag-meter">
        <div class="tag-meter-track">
          <span style="width:${item.urgentShare}%"></span>
        </div>
        <em>${item.urgentShare}% urgent</em>
      </div>
    `;
    tagGrid.appendChild(card);
  });

  const recent7 = getSignalsInRange(signals, -1, 7);
  const prior7 = getSignalsInRange(signals, 7, 14);
  const recentStats = getTagStats(recent7).reduce((acc, item) => {
    acc[item.tag] = item.count;
    return acc;
  }, {});
  const priorStats = getTagStats(prior7).reduce((acc, item) => {
    acc[item.tag] = item.count;
    return acc;
  }, {});

  const movement = Array.from(
    new Set([...Object.keys(recentStats), ...Object.keys(priorStats)])
  ).map((tag) => ({
    tag,
    delta: (recentStats[tag] || 0) - (priorStats[tag] || 0)
  }));

  const emerging = movement
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);
  const cooling = movement
    .filter((item) => item.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3);

  const emergingList = emerging.length
    ? emerging.map((item) => `<li>#${item.tag} (+${item.delta})</li>`).join("")
    : "<li>No emerging tags this week.</li>";
  const coolingList = cooling.length
    ? cooling.map((item) => `<li>#${item.tag} (${item.delta})</li>`).join("")
    : "<li>No cooling tags this week.</li>";

  tagInsights.innerHTML = `
    <div>
      <p class="label">Emerging</p>
      <ul>${emergingList}</ul>
    </div>
    <div>
      <p class="label">Cooling</p>
      <ul>${coolingList}</ul>
    </div>
  `;
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

  const signalMap = new Map(getSignals().map((signal) => [signal.id, signal]));

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
    statusSelect.addEventListener("change", async () => {
      item.status = statusSelect.value;
      if (dataMode === "cloud") {
        const updated = await updateCommitmentRemote(item.id, item.status);
        if (updated) {
          setCommitments(updated);
        } else {
          setCommitments(commitments);
        }
      } else {
        setCommitments(commitments);
      }
    });

    header.innerHTML = `<span>${item.owner}</span><span>Due ${item.due}</span>`;

    const linkedSignal = item.signalId ? signalMap.get(item.signalId) : null;
    const linkedMarkup = linkedSignal
      ? `<div class="tracker-link">Linked · ${linkedSignal.title}</div>`
      : "";

    card.innerHTML = `
      <strong>${item.commitment}</strong>
      ${linkedMarkup}
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
  updateMomentum(signals);
  renderTagTrends(signals);
  renderListeningHealth(signals);
  renderTriage(signals);
  renderPlaybook(signals);
  renderFeed(filtered);
}

function handleResetFilters() {
  searchInput.value = "";
  filterSource.value = "all";
  filterUrgency.value = "all";
  filterSentiment.value = "1";
  filterTag.value = "";
  renderAll();
}

function setDataStatus() {
  if (dataMode === "cloud") {
    const syncText = lastSync
      ? `Last sync ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Sync ready";
    dataModeStatus.textContent = "Cloud sync";
    dataModeDetail.textContent = `Shared workspace mode · ${syncText}.`;
    dataModeToggle.textContent = "Use local only";
    dataModeToggle.disabled = false;
    dataRefreshBtn.disabled = !remoteAvailable;
    dataFooter.textContent =
      "Community Pulse · Cloud sync enabled for shared teams.";
    return;
  }

  dataModeStatus.textContent = "Local only";
  dataModeDetail.textContent = remoteAvailable
    ? "Cloud available; staying local on this device."
    : "Stored in your browser only.";
  dataModeToggle.textContent = remoteAvailable
    ? "Use cloud sync"
    : "Cloud unavailable";
  dataModeToggle.disabled = !remoteAvailable;
  dataRefreshBtn.disabled = !remoteAvailable;
  dataFooter.textContent =
    "Local-first Community Pulse · Data stored in your browser only.";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return response.json();
}

async function checkRemote() {
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    if (!response.ok) throw new Error("Health check failed");
    const data = await response.json();
    remoteAvailable = Boolean(data.ok);
  } catch (error) {
    remoteAvailable = false;
  }
}

async function refreshFromRemote() {
  try {
    const [signalsData, commitmentsData] = await Promise.all([
      fetchJson("/api/signals"),
      fetchJson("/api/commitments")
    ]);
    setSignals(signalsData.signals || []);
    setCommitments(commitmentsData.commitments || []);
    lastSync = new Date();
    remoteAvailable = true;
    dataMode = "cloud";
    setDataStatus();
    return true;
  } catch (error) {
    remoteAvailable = false;
    dataMode = "local";
    setDataStatus();
    return false;
  }
}

async function createSignalRemote(signal) {
  try {
    const data = await fetchJson("/api/signals", {
      method: "POST",
      body: JSON.stringify(signal)
    });
    lastSync = new Date();
    remoteAvailable = true;
    dataMode = "cloud";
    setDataStatus();
    return data.signals || [];
  } catch (error) {
    remoteAvailable = false;
    dataMode = "local";
    setDataStatus();
    return null;
  }
}

async function createCommitmentRemote(commitment) {
  try {
    const data = await fetchJson("/api/commitments", {
      method: "POST",
      body: JSON.stringify(commitment)
    });
    lastSync = new Date();
    remoteAvailable = true;
    dataMode = "cloud";
    setDataStatus();
    return data.commitments || [];
  } catch (error) {
    remoteAvailable = false;
    dataMode = "local";
    setDataStatus();
    return null;
  }
}

async function updateCommitmentRemote(id, status) {
  try {
    const data = await fetchJson("/api/commitments", {
      method: "PUT",
      body: JSON.stringify({ id, status })
    });
    lastSync = new Date();
    remoteAvailable = true;
    dataMode = "cloud";
    setDataStatus();
    return data.commitments || [];
  } catch (error) {
    remoteAvailable = false;
    dataMode = "local";
    setDataStatus();
    return null;
  }
}

async function seedRemote() {
  try {
    await fetchJson("/api/seed", { method: "POST" });
    lastSync = new Date();
    remoteAvailable = true;
    return true;
  } catch (error) {
    remoteAvailable = false;
    return false;
  }
}

async function importRemote(payload) {
  try {
    await fetchJson("/api/import", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    lastSync = new Date();
    remoteAvailable = true;
    return true;
  } catch (error) {
    remoteAvailable = false;
    return false;
  }
}

async function handleSignalSubmit(event) {
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

  if (dataMode === "cloud") {
    const updated = await createSignalRemote(newSignal);
    if (updated) {
      setSignals(updated);
    } else {
      setSignals([newSignal, ...getSignals()]);
    }
  } else {
    setSignals([newSignal, ...getSignals()]);
  }

  signalForm.reset();
  sentimentInput.value = "3";
  updateSentimentDisplay(3);
}

async function handleCommitmentSubmit(event) {
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

  if (dataMode === "cloud") {
    const updated = await createCommitmentRemote(commitment);
    if (updated) {
      setCommitments(updated);
    } else {
      setCommitments([commitment, ...getCommitments()]);
    }
  } else {
    setCommitments([commitment, ...getCommitments()]);
  }

  trackerForm.reset();
}

async function handleSeed() {
  if (dataMode === "cloud") {
    const seeded = await seedRemote();
    if (seeded) {
      await refreshFromRemote();
    }
    return;
  }

  const signals = getSignals();
  const mergedSignals = [...sampleSignals, ...signals];
  const uniqueSignals = Array.from(
    new Map(mergedSignals.map((item) => [item.id, item])).values()
  );
  setSignals(uniqueSignals);

  const commitments = getCommitments();
  const mergedCommitments = [...sampleCommitments, ...commitments];
  const uniqueCommitments = Array.from(
    new Map(mergedCommitments.map((item) => [item.id, item])).values()
  );
  setCommitments(uniqueCommitments);
}

function handleExport() {
  const payload = {
    generatedAt: new Date().toISOString(),
    dataMode,
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
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const signals = Array.isArray(parsed.signals) ? parsed.signals : [];
      const commitments = Array.isArray(parsed.commitments)
        ? parsed.commitments
        : [];

      if (dataMode === "cloud" && remoteAvailable) {
        const imported = await importRemote({ signals, commitments });
        if (imported) {
          await refreshFromRemote();
          return;
        }
      }

      if (signals.length) {
        setSignals(signals);
      }
      if (commitments.length) {
        setCommitments(commitments);
      }
    } catch (error) {
      console.error("Failed to import JSON", error);
    }
  };
  reader.readAsText(file);
}

async function handleToggleMode() {
  if (dataMode === "cloud") {
    modePreference = "local";
    storage.set(MODE_KEY, "local");
    dataMode = "local";
    setDataStatus();
    return;
  }

  modePreference = "auto";
  storage.set(MODE_KEY, "auto");
  await checkRemote();
  if (remoteAvailable) {
    await refreshFromRemote();
  } else {
    dataMode = "local";
    setDataStatus();
  }
}

async function handleRefreshRemote() {
  if (!remoteAvailable) return;
  await refreshFromRemote();
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
dataModeToggle.addEventListener("click", handleToggleMode);
dataRefreshBtn.addEventListener("click", handleRefreshRemote);

[searchInput, filterSource, filterUrgency, filterSentiment, filterTag].forEach(
  (input) => input.addEventListener("input", renderAll)
);

async function init() {
  updateSentimentDisplay(sentimentInput.value);
  updateSourceFilter(getSignals());
  renderAll();
  renderCommitments(getCommitments());
  renderCommitmentPulse(getCommitments());

  await checkRemote();
  if (remoteAvailable && modePreference !== "local") {
    const refreshed = await refreshFromRemote();
    if (!refreshed) {
      dataMode = "local";
    }
  } else {
    dataMode = "local";
    setDataStatus();
  }
}

init();
