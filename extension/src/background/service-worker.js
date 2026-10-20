const ALARM_RULE_UPDATE = "ruleUpdateCheck";
const ALARM_RESUME_BLOCKING = "resumeBlocking";
const RULESET_MAIN_ID = "ruleset_main";
const PAUSE_OVERRIDE_RULE_ID = 999999999;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const RULE_UPDATE_PERIOD_MINUTES = 6 * 60;
const NOTIFICATION_ICON_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgJ4X4wAAAABJRU5ErkJggg==";
const MAX_DYNAMIC_RULES = 5000;

// Set this when your rules update endpoint is ready.
const RULE_UPDATE_METADATA_URL = "";

const DEFAULT_STATE = {
  extensionEnabled: true,
  temporaryDisableUntil: null,
  blockedCountSession: 0,
  blockedCountTotal: 0,
  activeRulesVersion: "bundled-0.1.0",
  lastUpdateCheckAt: 0,
  lastUpdateStatus: "not-configured",
  lastKnownGoodRulesVersion: "bundled-0.1.0"
};

chrome.runtime.onInstalled.addListener(async () => {
  await initializeState();
  await ensureUpdateAlarm();
  await applyEffectiveBlockingState();
});

chrome.runtime.onStartup.addListener(async () => {
  await initializeState();
  await setState({ blockedCountSession: 0 });
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

let counterQueue = Promise.resolve();
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((event) => {
    if (event.rule.ruleId === PAUSE_OVERRIDE_RULE_ID) return;
    counterQueue = counterQueue.catch(() => {}).then(async () => {
      const state = await getState();
      await setState({
        blockedCountSession: state.blockedCountSession + 1,
        blockedCountTotal: state.blockedCountTotal + 1
      });
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
      if (typeof message.enabled !== "boolean") throw new Error("enabled must be a boolean");
      const nextEnabled = message.enabled;
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
  const stored = await getState();
  if (typeof stored.temporaryDisableUntil === "number") {
    if (stored.temporaryDisableUntil <= Date.now()) {
      await setState({ temporaryDisableUntil: null });
      await chrome.alarms.clear(ALARM_RESUME_BLOCKING);
    } else {
      await chrome.alarms.create(ALARM_RESUME_BLOCKING, { when: stored.temporaryDisableUntil });
    }
  }
  const state = withDerivedState(await getState());
  const shouldEnableRules = state.effectiveBlockingEnabled;

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: shouldEnableRules ? [RULESET_MAIN_ID] : [],
    disableRulesetIds: shouldEnableRules ? [] : [RULESET_MAIN_ID]
  });

  if (shouldEnableRules) {
    await removePauseOverrideRule();
  } else {
    await ensurePauseOverrideRule();
  }
}

async function runRuleUpdateCheck() {
  await setState({ lastUpdateCheckAt: Date.now() });

  if (!RULE_UPDATE_METADATA_URL) {
    await setState({ lastUpdateStatus: "not-configured" });
    return;
  }

  try {
    const metadata = await fetchMetadata(RULE_UPDATE_METADATA_URL);
    const state = await getState();

    if (metadata.version === state.activeRulesVersion) {
      await setState({ lastUpdateStatus: "ok" });
      return;
    }

    const remoteRules = await fetchRules(metadata, RULE_UPDATE_METADATA_URL);
    validateRemoteRules(metadata, remoteRules);

    const normalized = normalizeRemoteRules(remoteRules);
    if (normalized.length > MAX_DYNAMIC_RULES) {
      throw new Error(
        `Remote rules exceed dynamic limit (${normalized.length} > ${MAX_DYNAMIC_RULES})`
      );
    }

    const checksum = await sha256OfJson(remoteRules);
    if (checksum !== metadata.checksumSha256) {
      throw new Error("Checksum mismatch for downloaded rules");
    }

    await applyDynamicRulesWithRollback(normalized);
    await setState({
      activeRulesVersion: metadata.version,
      lastKnownGoodRulesVersion: metadata.version,
      lastUpdateStatus: "ok"
    });

    await createNotification(
      "Rules updated",
      `Updated to ${metadata.version} (${normalized.length} rules).`
    ).catch(() => {});
  } catch (_error) {
    await setState({ lastUpdateStatus: "failed" });
    await createNotification("Rule update failed", "Continuing with current rules. Will retry automatically.").catch(() => {});
  }
}

async function fetchMetadata(metadataUrl) {
  if (new URL(metadataUrl).protocol !== "https:") throw new Error("Updates require HTTPS");
  const response = await fetch(metadataUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Update metadata request failed: ${response.status}`);
  }

  const metadata = await response.json();
  if (!metadata || typeof metadata !== "object") {
    throw new Error("Invalid metadata payload");
  }

  if (typeof metadata.version !== "string" || !metadata.version) {
    throw new Error("Invalid metadata.version");
  }

  if (typeof metadata.checksumSha256 !== "string" || !/^[a-f0-9]{64}$/.test(metadata.checksumSha256)) {
    throw new Error("Invalid metadata.checksumSha256");
  }

  if (!Number.isInteger(metadata.ruleCount) || metadata.ruleCount < 1 || metadata.ruleCount >= MAX_DYNAMIC_RULES) {
    throw new Error("Invalid metadata.ruleCount");
  }
  return metadata;
}

async function fetchRules(metadata, metadataUrl) {
  const rulesUrl = resolveRulesUrl(metadata, metadataUrl);
  const response = await fetch(rulesUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Rules request failed: ${response.status}`);
  }

  return await response.json();
}

function resolveRulesUrl(metadata, metadataUrl) {
  const fileName = metadata.rulesUrl || (
    typeof metadata.rulesFile === "string" && metadata.rulesFile.length > 0
      ? metadata.rulesFile
      : "ruleset_main.json");

  const resolved = new URL(fileName, metadataUrl);
  if (resolved.protocol !== "https:" || resolved.origin !== new URL(metadataUrl).origin) {
    throw new Error("Rules must use the HTTPS metadata origin");
  }
  return resolved.toString();
}

function validateRemoteRules(metadata, rules) {
  if (!Array.isArray(rules) || rules.length === 0 || rules.length >= MAX_DYNAMIC_RULES) {
    throw new Error("Rules payload must be an array");
  }

  if (typeof metadata.ruleCount === "number" && rules.length !== metadata.ruleCount) {
    throw new Error(`Rule count mismatch: expected ${metadata.ruleCount}, got ${rules.length}`);
  }

  const ids = new Set();
  const types = new Set(["main_frame", "sub_frame", "stylesheet", "script", "image", "font",
    "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]);
  for (const rule of rules) {
    if (!Number.isInteger(rule.id) || rule.id < 1 || rule.id === PAUSE_OVERRIDE_RULE_ID || ids.has(rule.id) ||
        !Number.isInteger(rule.priority) || rule.priority < 1 || rule.priority > 100 ||
        rule.action?.type !== "block" || Object.keys(rule.action).length !== 1 ||
        Object.keys(rule).some((key) => !["id", "priority", "action", "condition"].includes(key))) {
      throw new Error("Invalid block rule");
    }
    ids.add(rule.id);
    if (Object.keys(rule?.condition ?? {}).some((key) =>
      !["urlFilter", "resourceTypes", "domainType", "initiatorDomains", "excludedInitiatorDomains"].includes(key))) {
      throw new Error("Unsupported rule condition");
    }
    const condition = rule.condition;
    if (typeof condition?.urlFilter !== "string" || !condition.urlFilter ||
        !Array.isArray(condition.resourceTypes) || !condition.resourceTypes.length ||
        condition.resourceTypes.some((type) => !types.has(type)) ||
        (condition.domainType !== undefined && !["firstParty", "thirdParty"].includes(condition.domainType))) {
      throw new Error("Invalid rule condition");
    }
    for (const key of ["initiatorDomains", "excludedInitiatorDomains"]) {
      if (condition[key] !== undefined && (!Array.isArray(condition[key]) || !condition[key].length ||
          condition[key].some((domain) => typeof domain !== "string" ||
            !/^[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?$/.test(domain)))) {
        throw new Error("Invalid initiator domains");
      }
    }
  }
}

function normalizeRemoteRules(rules) {
  // Validation precedes this call. Preserve the checksum-verified semantics exactly.
  return structuredClone(rules);
}

async function sha256OfJson(value) {
  const text = JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function applyDynamicRulesWithRollback(nextRules) {
  const current = await chrome.declarativeNetRequest.getDynamicRules();
  const currentUserRules = current.filter((rule) => rule.id !== PAUSE_OVERRIDE_RULE_ID);

  const removeRuleIds = currentUserRules.map((rule) => rule.id);

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: nextRules
    });
  } catch (error) {
    const attemptedIds = nextRules.map((rule) => rule.id);
    const latest = await chrome.declarativeNetRequest.getDynamicRules();
    const latestUserRuleIds = latest
      .filter((rule) => rule.id !== PAUSE_OVERRIDE_RULE_ID)
      .map((rule) => rule.id);
    const rollbackRemoveIds = Array.from(new Set([...attemptedIds, ...latestUserRuleIds]));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rollbackRemoveIds,
      addRules: currentUserRules
    });

    throw error;
  }
}

async function ensurePauseOverrideRule() {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (dynamicRules.some((rule) => rule.id === PAUSE_OVERRIDE_RULE_ID)) {
    return;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: PAUSE_OVERRIDE_RULE_ID,
        priority: 1000000,
        action: {
          type: "allow"
        },
        condition: {
          regexFilter: ".*",
          resourceTypes: [
            "main_frame",
            "sub_frame",
            "stylesheet",
            "script",
            "image",
            "font",
            "object",
            "xmlhttprequest",
            "ping",
            "csp_report",
            "media",
            "websocket",
            "other"
          ]
        }
      }
    ],
    removeRuleIds: []
  });
}

async function removePauseOverrideRule() {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (!dynamicRules.some((rule) => rule.id === PAUSE_OVERRIDE_RULE_ID)) {
    return;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [PAUSE_OVERRIDE_RULE_ID]
  });
}

async function createNotification(title, message) {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: NOTIFICATION_ICON_DATA_URL,
    title,
    message
  });
}
