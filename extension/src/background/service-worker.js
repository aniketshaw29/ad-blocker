const ALARM_RULE_UPDATE = "ruleUpdateCheck";
const ALARM_RESUME_BLOCKING = "resumeBlocking";
const RULESET_MAIN_ID = "ruleset_main";
const TEN_MINUTES_MS = 10 * 60 * 1000;
const RULE_UPDATE_PERIOD_MINUTES = 6 * 60;
const NOTIFICATION_ICON_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgJ4X4wAAAABJRU5ErkJggg==";

// Set this when your rules update endpoint is ready.
const RULE_UPDATE_METADATA_URL = "";

const DEFAULT_STATE = {
  extensionEnabled: true,
  temporaryDisableUntil: null,
  blockedCountSession: 0,
  blockedCountTotal: 0,
  activeRulesVersion: "bundled-0.1.0",
  lastUpdateCheckAt: 0,
  lastUpdateStatus: "ok",
  lastKnownGoodRulesVersion: "bundled-0.1.0"
};

chrome.runtime.onInstalled.addListener(async () => {
  await initializeState();
  await ensureUpdateAlarm();
  await applyEffectiveBlockingState();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeState();
  await ensureUpdateAlarm();
  await applyEffectiveBlockingState();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_RESUME_BLOCKING) {
    await maybeResumeFromTemporaryDisable();
    return;
  }

  if (alarm.name === ALARM_RULE_UPDATE) {
    await runRuleUpdateCheck();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((error) => sendResponse({ ok: false, error: String(error) }));

  return true;
});

if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(async () => {
    const state = await getState();
    await setState({
      blockedCountSession: state.blockedCountSession + 1,
      blockedCountTotal: state.blockedCountTotal + 1
    });
  });
}

async function handleMessage(message) {
  switch (message?.type) {
    case "getState": {
      const state = await getState();
      return { state: withDerivedState(state) };
    }
    case "setEnabled": {
      const nextEnabled = Boolean(message.enabled);
      await setState({ extensionEnabled: nextEnabled });
      await applyEffectiveBlockingState();
      const state = await getState();
      return { state: withDerivedState(state) };
    }
    case "pauseTenMinutes": {
      const until = Date.now() + TEN_MINUTES_MS;
      await setState({ temporaryDisableUntil: until });
      chrome.alarms.create(ALARM_RESUME_BLOCKING, { when: until });
      await applyEffectiveBlockingState();
      const state = await getState();
      return { state: withDerivedState(state) };
    }
    case "resumeNow": {
      await setState({ temporaryDisableUntil: null });
      await chrome.alarms.clear(ALARM_RESUME_BLOCKING);
      await applyEffectiveBlockingState();
      const state = await getState();
      return { state: withDerivedState(state) };
    }
    default:
      throw new Error("Unknown message type");
  }
}

function withDerivedState(state) {
  const now = Date.now();
  const pausedUntil = state.temporaryDisableUntil;
  const isPaused = typeof pausedUntil === "number" && pausedUntil > now;
  const pauseRemainingMs = isPaused ? pausedUntil - now : 0;

  return {
    ...state,
    isPaused,
    pauseRemainingMs,
    effectiveBlockingEnabled: state.extensionEnabled && !isPaused
  };
}

async function initializeState() {
  const existing = await chrome.storage.local.get(Object.keys(DEFAULT_STATE));
  const patch = {};

  for (const [key, value] of Object.entries(DEFAULT_STATE)) {
    if (typeof existing[key] === "undefined") {
      patch[key] = value;
    }
  }

  if (Object.keys(patch).length > 0) {
    await chrome.storage.local.set(patch);
  }
}

async function getState() {
  const stored = await chrome.storage.local.get(Object.keys(DEFAULT_STATE));
  return { ...DEFAULT_STATE, ...stored };
}

async function setState(partial) {
  await chrome.storage.local.set(partial);
}

async function ensureUpdateAlarm() {
  const alarm = await chrome.alarms.get(ALARM_RULE_UPDATE);
  if (!alarm) {
    chrome.alarms.create(ALARM_RULE_UPDATE, {
      delayInMinutes: RULE_UPDATE_PERIOD_MINUTES,
      periodInMinutes: RULE_UPDATE_PERIOD_MINUTES
    });
  }
}

async function maybeResumeFromTemporaryDisable() {
  const state = await getState();
  const pauseUntil = state.temporaryDisableUntil;
  const expired = typeof pauseUntil === "number" && pauseUntil <= Date.now();

  if (expired) {
    await setState({ temporaryDisableUntil: null });
    await applyEffectiveBlockingState();
  }
}

async function applyEffectiveBlockingState() {
  const state = withDerivedState(await getState());
  const shouldEnableRules = state.effectiveBlockingEnabled;

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: shouldEnableRules ? [RULESET_MAIN_ID] : [],
    disableRulesetIds: shouldEnableRules ? [] : [RULESET_MAIN_ID]
  });
}

async function runRuleUpdateCheck() {
  await setState({ lastUpdateCheckAt: Date.now() });

  if (!RULE_UPDATE_METADATA_URL) {
    await setState({ lastUpdateStatus: "ok" });
    return;
  }

  try {
    const response = await fetch(RULE_UPDATE_METADATA_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Update metadata request failed: ${response.status}`);
    }

    // Placeholder: package download, verify, atomic apply, rollback.
    await setState({ lastUpdateStatus: "ok" });
    await createNotification("Rules updated", "Blocking rules were checked and are up to date.");
  } catch (_error) {
    await setState({ lastUpdateStatus: "failed" });
    await createNotification("Rule update failed", "Continuing with current rules. Will retry automatically.");
  }
}

async function createNotification(title, message) {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: NOTIFICATION_ICON_DATA_URL,
    title,
    message
  });
}
