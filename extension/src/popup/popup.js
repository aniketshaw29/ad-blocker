const enabledToggle = document.getElementById("enabled-toggle");
const statusLine = document.getElementById("status-line");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const sessionCount = document.getElementById("session-count");
const totalCount = document.getElementById("total-count");

let stateCache = null;
let ticker = null;

document.addEventListener("DOMContentLoaded", async () => {
  await refresh();
  bindEvents();
  ticker = setInterval(() => render(stateCache), 1000);
});

window.addEventListener("unload", () => {
  if (ticker) {
    clearInterval(ticker);
  }
});

function bindEvents() {
  enabledToggle.addEventListener("change", async () => {
    const result = await sendMessage({ type: "setEnabled", enabled: enabledToggle.checked });
    if (result.ok) {
      stateCache = result.state;
      render(stateCache);
    }
  });

  pauseBtn.addEventListener("click", async () => {
    const result = await sendMessage({ type: "pauseTenMinutes" });
    if (result.ok) {
      stateCache = result.state;
      render(stateCache);
    }
  });

  resumeBtn.addEventListener("click", async () => {
    const result = await sendMessage({ type: "resumeNow" });
    if (result.ok) {
      stateCache = result.state;
      render(stateCache);
    }
  });
}

async function refresh() {
  const result = await sendMessage({ type: "getState" });
  if (result.ok) {
    stateCache = result.state;
    render(stateCache);
  } else {
    statusLine.textContent = "Unable to load extension state.";
  }
}

function render(state) {
  if (!state) {
    return;
  }

  enabledToggle.checked = state.extensionEnabled;
  sessionCount.textContent = String(state.blockedCountSession);
  totalCount.textContent = String(state.blockedCountTotal);

  if (!state.extensionEnabled) {
    statusLine.textContent = "Blocking is OFF globally.";
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    return;
  }

  if (state.isPaused) {
    const secs = Math.max(0, Math.ceil(state.pauseRemainingMs / 1000));
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    statusLine.textContent = `Paused: ${mins}:${String(remSecs).padStart(2, "0")} remaining`;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    return;
  }

  statusLine.textContent = "Blocking is ON (aggressive).";
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
}

function sendMessage(message) {
  return chrome.runtime.sendMessage(message);
}
