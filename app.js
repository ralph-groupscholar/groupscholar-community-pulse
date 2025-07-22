const storageKey = "gscpulse-signals";

const formatNumber = (value, digits = 2) => Number(value).toFixed(digits);
const today = () => new Date().toISOString().slice(0, 10);

const loadSignals = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse stored signals", error);
    return [];
  }
};

const saveSignals = (signals) => {
  localStorage.setItem(storageKey, JSON.stringify(signals));
};

const state = {
  signals: loadSignals(),
};

const elements = {
  list: document.getElementById("signal-list"),
  search: document.getElementById("search"),
  filterTheme: document.getElementById("filter-theme"),
  filterUrgency: document.getElementById("filter-urgency"),
  form: document.getElementById("signal-form"),
  seed: document.getElementById("seed-data"),
  export: document.getElementById("export-json"),
  reset: document.getElementById("reset-data"),
  metrics: {
    total: document.getElementById("metric-total"),
    sentiment: document.getElementById("metric-sentiment"),
    urgent: document.getElementById("metric-urgent"),
    due: document.getElementById("metric-due"),
  },
  insights: {
    drift: document.getElementById("insight-drift"),
    theme: document.getElementById("insight-theme"),
    source: document.getElementById("insight-source"),
    themeMix: document.getElementById("theme-mix"),
    urgencyMix: document.getElementById("urgency-mix"),
  },
  queue: document.getElementById("action-queue"),
};

const uniqueValues = (signals, key) =>
  [...new Set(signals.map((signal) => signal[key]))].sort();

const sentimentLabel = (value) => {
  if (value >= 1) return "Positive";
  if (value <= -1) return "Needs attention";
  return "Neutral";
};

const deriveMetrics = (signals) => {
  const total = signals.length;
  const avgSentiment = total
    ? signals.reduce((sum, signal) => sum + Number(signal.sentiment || 0), 0) / total
    : 0;
  const urgent = signals.filter((signal) => signal.urgency === "high").length;
  const due = signals.filter((signal) => signal.response_due).length;
  return { total, avgSentiment, urgent, due };
};

const getDominant = (signals, key) => {
  if (!signals.length) return "—";
  const counts = signals.reduce((acc, signal) => {
    const value = signal[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

const renderBars = (container, data) => {
  container.innerHTML = "";
  const max = Math.max(...Object.values(data), 1);
  Object.entries(data).forEach(([label, value]) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
      <strong>${label}</strong>
      <span style="--fill: ${(value / max) * 100}%"></span>
      <em>${value}</em>
    `;
    container.appendChild(bar);
  });
};

const renderList = (signals) => {
  elements.list.innerHTML = "";
  if (!signals.length) {
    elements.list.innerHTML = "<p>No signals yet. Add one to get started.</p>";
    return;
  }

  signals
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((signal) => {
      const card = document.createElement("article");
      card.className = "signal-card";
      card.innerHTML = `
        <div class="signal-meta">
          <span>${signal.date}</span>
          <span>${signal.source}</span>
        </div>
        <strong>${signal.theme}</strong>
        <p>${signal.notes}</p>
        <div class="signal-tags">
          <span class="tag ${signal.urgency}">${signal.urgency} urgency</span>
          <span class="tag">${sentimentLabel(signal.sentiment)}</span>
          ${signal.response_due ? "<span class=\"tag\">Response due</span>" : ""}
        </div>
      `;
      elements.list.appendChild(card);
    });
};

const renderQueue = (signals) => {
  elements.queue.innerHTML = "";
  const queue = signals.filter((signal) => signal.response_due || signal.urgency === "high");
  if (!queue.length) {
    elements.queue.innerHTML = "<li>No escalations at the moment.</li>";
    return;
  }
  queue.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = `${signal.theme} · ${signal.source} · ${signal.notes}`;
    elements.queue.appendChild(item);
  });
};

const renderInsights = (signals) => {
  const metrics = deriveMetrics(signals);
  elements.metrics.total.textContent = metrics.total;
  elements.metrics.sentiment.textContent = formatNumber(metrics.avgSentiment, 2);
  elements.metrics.urgent.textContent = metrics.urgent;
  elements.metrics.due.textContent = metrics.due;

  elements.insights.drift.textContent = sentimentLabel(metrics.avgSentiment);
  elements.insights.theme.textContent = getDominant(signals, "theme");
  elements.insights.source.textContent = getDominant(signals, "source");

  const themeCounts = signals.reduce((acc, signal) => {
    acc[signal.theme] = (acc[signal.theme] || 0) + 1;
    return acc;
  }, {});
  const urgencyCounts = signals.reduce((acc, signal) => {
    acc[signal.urgency] = (acc[signal.urgency] || 0) + 1;
    return acc;
  }, {});
  renderBars(elements.insights.themeMix, themeCounts);
  renderBars(elements.insights.urgencyMix, urgencyCounts);
};

const populateFilters = () => {
  const themes = uniqueValues(state.signals, "theme");
  elements.filterTheme.innerHTML = "<option value=\"all\">All themes</option>";
  themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme;
    elements.filterTheme.appendChild(option);
  });
};

const getFilteredSignals = () => {
  const query = elements.search.value.toLowerCase();
  const theme = elements.filterTheme.value;
  const urgency = elements.filterUrgency.value;

  return state.signals.filter((signal) => {
    const matchesQuery =
      signal.notes.toLowerCase().includes(query) ||
      signal.theme.toLowerCase().includes(query) ||
      signal.source.toLowerCase().includes(query);
    const matchesTheme = theme === "all" || signal.theme === theme;
    const matchesUrgency = urgency === "all" || signal.urgency === urgency;
    return matchesQuery && matchesTheme && matchesUrgency;
  });
};

const renderAll = () => {
  populateFilters();
  const filtered = getFilteredSignals();
  renderList(filtered);
  renderQueue(filtered);
  renderInsights(state.signals);
};

const addSignal = (signal) => {
  state.signals.unshift(signal);
  saveSignals(state.signals);
  renderAll();
};

const wireEvents = () => {
  [elements.search, elements.filterTheme, elements.filterUrgency].forEach((element) => {
    element.addEventListener("input", renderAll);
    element.addEventListener("change", renderAll);
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const signal = {
      id: `sig-${Date.now()}`,
      date: today(),
      source: formData.get("source"),
      theme: formData.get("theme"),
      sentiment: Number(formData.get("sentiment")),
      urgency: formData.get("urgency"),
      notes: formData.get("notes"),
      response_due: formData.get("response_due") === "on",
    };
    addSignal(signal);
    elements.form.reset();
  });

  elements.seed.addEventListener("click", () => {
    if (!state.signals.length) {
      state.signals = seedSignals.slice();
    } else {
      state.signals = [...seedSignals, ...state.signals];
    }
    saveSignals(state.signals);
    renderAll();
  });

  elements.export.addEventListener("click", () => {
    const payload = JSON.stringify(state.signals, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `community-pulse-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  elements.reset.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    state.signals = [];
    renderAll();
  });
};

const init = () => {
  renderAll();
  wireEvents();
};

init();
