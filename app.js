const STORAGE_KEY = "groupscholar-community-pulse";

const seedData = {
  signals: [
    {
      id: crypto.randomUUID(),
      title: "Scholar cohort reporting housing stress",
      theme: "Basic needs",
      segment: "First-year scholars",
      urgency: "High",
      owner: "Community Lead",
      followup: "Coordinate emergency aid clinic and partner referrals.",
      timestamp: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Mentor engagement dipping post midterms",
      theme: "Mentor program",
      segment: "Mentors",
      urgency: "Medium",
      owner: "Mentor Ops",
      followup: "Offer midterm reset and appreciation touchpoints.",
      timestamp: new Date().toISOString(),
    },
  ],
  posts: [
    {
      id: crypto.randomUUID(),
      name: "Campus advisors",
      frequency: "Weekly",
      trust: 4,
      pulse: "Staffing gaps slowing referrals.",
    },
    {
      id: crypto.randomUUID(),
      name: "Alumni ambassadors",
      frequency: "Biweekly",
      trust: 5,
      pulse: "Strong advocacy, need updated talking points.",
    },
  ],
  checkins: [
    {
      id: crypto.randomUUID(),
      moment: "January cohort standup",
      score: 7,
      notes: "Excitement around internships; stress on transportation costs.",
    },
  ],
  actions: [
    {
      id: crypto.randomUUID(),
      action: "Launch emergency aid clinic",
      owner: "Scholar Success",
      due: new Date().toISOString().slice(0, 10),
      status: "In Progress",
    },
  ],
  notes: "",
};

const state = loadState();

const snapshotEl = document.getElementById("snapshot");
const postListEl = document.getElementById("post-list");
const checkinListEl = document.getElementById("checkin-list");
const signalListEl = document.getElementById("signal-list");
const actionListEl = document.getElementById("action-list");
const notesEl = document.getElementById("notes");

const dialogMap = {
  signal: document.getElementById("signal-dialog"),
  post: document.getElementById("post-dialog"),
  checkin: document.getElementById("checkin-dialog"),
  action: document.getElementById("action-dialog"),
};

const forms = {
  signal: document.getElementById("signal-form"),
  post: document.getElementById("post-form"),
  checkin: document.getElementById("checkin-form"),
  action: document.getElementById("action-form"),
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(seedData);
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      signals: parsed.signals ?? [],
      posts: parsed.posts ?? [],
      checkins: parsed.checkins ?? [],
      actions: parsed.actions ?? [],
      notes: parsed.notes ?? "",
    };
  } catch (error) {
    console.warn("Failed to parse state", error);
    return structuredClone(seedData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderSnapshot() {
  const highUrgency = state.signals.filter((signal) => signal.urgency === "High").length;
  const avgScore = state.checkins.length
    ? Math.round(
        (state.checkins.reduce((sum, checkin) => sum + Number(checkin.score || 0), 0) /
          state.checkins.length) * 10
      ) / 10
    : 0;
  const openActions = state.actions.filter((action) => action.status !== "Done").length;

  const cards = [
    { label: "Signals logged", value: state.signals.length },
    { label: "High urgency", value: highUrgency },
    { label: "Avg sentiment", value: avgScore || "-" },
    { label: "Open actions", value: openActions },
  ];

  snapshotEl.innerHTML = cards
    .map(
      (card) => `
        <div class="snapshot">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </div>
      `
    )
    .join("");
}

function renderPosts() {
  postListEl.innerHTML = state.posts
    .map(
      (post) => `
      <div class="card">
        <strong>${post.name}</strong>
        <div class="tag-row">
          <span class="tag">${post.frequency}</span>
          <span class="tag soft">Trust ${post.trust}/5</span>
        </div>
        <p>${post.pulse}</p>
      </div>
    `
    )
    .join("");
}

function renderCheckins() {
  checkinListEl.innerHTML = state.checkins
    .map(
      (checkin) => `
      <div class="card">
        <strong>${checkin.moment}</strong>
        <div class="tag-row">
          <span class="tag">Score ${checkin.score}/10</span>
        </div>
        <p>${checkin.notes || "No notes yet."}</p>
      </div>
    `
    )
    .join("");
}

let filterHighOnly = false;

function renderSignals() {
  const signals = filterHighOnly
    ? state.signals.filter((signal) => signal.urgency === "High")
    : state.signals;

  signalListEl.innerHTML = signals
    .map(
      (signal) => `
      <div class="card signal">
        <strong>${signal.title}</strong>
        <div class="tag-row">
          <span class="tag">${signal.theme}</span>
          <span class="tag soft">${signal.segment}</span>
          <span class="tag warn">${signal.urgency}</span>
        </div>
        <p><strong>Owner:</strong> ${signal.owner}</p>
        <p>${signal.followup || "No follow-up captured yet."}</p>
      </div>
    `
    )
    .join("");
}

function renderActions() {
  actionListEl.innerHTML = state.actions
    .map(
      (action) => `
      <div class="card">
        <strong>${action.action}</strong>
        <div class="tag-row">
          <span class="tag">${action.owner}</span>
          <span class="tag soft">Due ${action.due}</span>
          <span class="tag warn">${action.status}</span>
        </div>
      </div>
    `
    )
    .join("");
}

function renderNotes() {
  notesEl.value = state.notes;
}

function renderAll() {
  renderSnapshot();
  renderPosts();
  renderCheckins();
  renderSignals();
  renderActions();
  renderNotes();
}

function openDialog(name) {
  dialogMap[name].showModal();
}

function handleForm(name, formatter) {
  const form = forms[name];
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const entry = formatter(Object.fromEntries(data.entries()));
    state[name + "s"].unshift(entry);
    saveState();
    renderAll();
    form.reset();
    dialogMap[name].close();
  });
}

handleForm("signal", (values) => ({
  id: crypto.randomUUID(),
  title: values.title.trim(),
  theme: values.theme.trim(),
  segment: values.segment.trim(),
  urgency: values.urgency,
  owner: values.owner.trim(),
  followup: values.followup.trim(),
  timestamp: new Date().toISOString(),
}));

handleForm("post", (values) => ({
  id: crypto.randomUUID(),
  name: values.name.trim(),
  frequency: values.frequency.trim(),
  trust: Number(values.trust || 3),
  pulse: values.pulse.trim(),
}));

handleForm("checkin", (values) => ({
  id: crypto.randomUUID(),
  moment: values.moment.trim(),
  score: Number(values.score || 0),
  notes: values.notes.trim(),
}));

handleForm("action", (values) => ({
  id: crypto.randomUUID(),
  action: values.action.trim(),
  owner: values.owner.trim(),
  due: values.due,
  status: values.status,
}));

notesEl.addEventListener("input", (event) => {
  state.notes = event.target.value;
  saveState();
});

notesEl.addEventListener("blur", saveState);

const addSignalBtn = document.getElementById("add-signal");
const addPostBtn = document.getElementById("add-post");
const addCheckinBtn = document.getElementById("add-checkin");
const addActionBtn = document.getElementById("add-action");
const exportBtn = document.getElementById("export-data");
const filterHighBtn = document.getElementById("filter-high");
const saveNotesBtn = document.getElementById("save-notes");

addSignalBtn.addEventListener("click", () => openDialog("signal"));
addPostBtn.addEventListener("click", () => openDialog("post"));
addCheckinBtn.addEventListener("click", () => openDialog("checkin"));
addActionBtn.addEventListener("click", () => openDialog("action"));

filterHighBtn.addEventListener("click", () => {
  filterHighOnly = !filterHighOnly;
  filterHighBtn.textContent = filterHighOnly ? "Show All Signals" : "Show High Urgency";
  renderSignals();
});

exportBtn.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    snapshot: {
      signals: state.signals.length,
      highUrgency: state.signals.filter((signal) => signal.urgency === "High").length,
      avgSentiment: state.checkins.length
        ? state.checkins.reduce((sum, checkin) => sum + Number(checkin.score || 0), 0) /
          state.checkins.length
        : 0,
      openActions: state.actions.filter((action) => action.status !== "Done").length,
    },
    data: state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "community-pulse.json";
  link.click();
  URL.revokeObjectURL(url);
});

saveNotesBtn.addEventListener("click", () => {
  saveState();
  saveNotesBtn.textContent = "Saved";
  setTimeout(() => {
    saveNotesBtn.textContent = "Save Notes";
  }, 1200);
});

renderAll();
