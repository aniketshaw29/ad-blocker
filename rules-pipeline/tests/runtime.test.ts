import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { webcrypto } from "node:crypto";

function worker() {
  const state: Record<string, any> = {};
  const alarms = new Map<string, unknown>();
  let dynamic: any[] = [];
  let failNext = false;
  const event = () => ({ addListener() {} });
  const chrome = {
    runtime: { onInstalled: event(), onStartup: event(), onMessage: event() },
    storage: { local: {
      get: async () => ({ ...state }), set: async (patch: object) => { Object.assign(state, patch); }
    } },
    alarms: { onAlarm: event(), get: async (key: string) => alarms.get(key),
      create: async (key: string, alarm: unknown) => { alarms.set(key, alarm); },
      clear: async (key: string) => alarms.delete(key) },
    declarativeNetRequest: {
      updateEnabledRulesets: async () => {}, getDynamicRules: async () => structuredClone(dynamic),
      updateDynamicRules: async ({ removeRuleIds = [], addRules = [] }: any) => {
        if (failNext) { failNext = false; throw new Error("simulated apply failure"); }
        dynamic = dynamic.filter((rule) => !removeRuleIds.includes(rule.id)).concat(addRules);
      }
    },
    notifications: { create: async () => {} }
  };
  const context = vm.createContext({ chrome, Date, URL, TextEncoder, crypto: webcrypto, structuredClone });
  vm.runInContext(readFileSync("extension/src/background/service-worker.js", "utf8"), context);
  return { state, alarms, context, fail: () => { failNext = true; },
    rules: () => dynamic, run: (code: string) => vm.runInContext(code, context) };
}

const rule = { id: 5, priority: 2, action: { type: "block" }, condition: {
  urlFilter: "||ads.example.com^", resourceTypes: ["script"], domainType: "thirdParty",
  initiatorDomains: ["site.test"]
} };

test("updater validates and preserves scoped rules and matches pipeline checksum", async () => {
  const w = worker();
  w.context.rules = [rule];
  w.run("validateRemoteRules({ruleCount: 1}, rules)");
  assert.equal(JSON.stringify(w.run("normalizeRemoteRules(rules)")), JSON.stringify([rule]));
  const { createHash } = await import("node:crypto");
  assert.equal(await w.run("sha256OfJson(rules)"), createHash("sha256").update(JSON.stringify([rule])).digest("hex"));
  w.context.rules = [{ ...rule, priority: 1000001 }];
  assert.throws(() => w.run("validateRemoteRules({ruleCount: 1}, rules)"), /Invalid block/);
  assert.throws(() => w.run("resolveRulesUrl({rulesUrl:'http://evil.test/rules'}, 'https://updates.test/metadata.json')"), /HTTPS/);
});

test("pause restores alarm, preserves downloaded rules, and expires on reconciliation", async () => {
  const w = worker();
  w.context.rules = [rule];
  await w.run("initializeState();");
  await w.run("applyDynamicRulesWithRollback(rules)");
  await w.run("handleMessage({type:'pauseTenMinutes'})");
  assert.equal(w.rules().length, 2);
  w.alarms.clear();
  await w.run("applyEffectiveBlockingState()");
  assert.ok(w.alarms.has("resumeBlocking"));
  w.state.temporaryDisableUntil = Date.now() - 1;
  await w.run("applyEffectiveBlockingState()");
  assert.equal(w.state.temporaryDisableUntil, null);
  assert.equal(JSON.stringify(w.rules()), JSON.stringify([rule]));
  await assert.rejects(w.run("handleMessage({type:'setEnabled',enabled:'false'})"), /boolean/);
});

test("failed dynamic replacement retains previous package", async () => {
  const w = worker();
  w.context.rules = [rule];
  await w.run("applyDynamicRulesWithRollback(rules)");
  w.fail();
  await assert.rejects(w.run("applyDynamicRulesWithRollback([{...rules[0],id:9}])"), /simulated/);
  assert.equal(JSON.stringify(w.rules()), JSON.stringify([rule]));
});

test("popup countdown decreases with time instead of reusing cached milliseconds", () => {
  let now = 100000;
  const elements = new Map<string, any>();
  const document = {
    getElementById(id: string) {
      if (!elements.has(id)) elements.set(id, {});
      return elements.get(id);
    }, addEventListener() {}
  };
  const context = vm.createContext({ document, window: { addEventListener() {} },
    Date: { now: () => now } });
  vm.runInContext(readFileSync("extension/src/popup/popup.js", "utf8"), context);
  context.state = { extensionEnabled: true, temporaryDisableUntil: now + 600000,
    blockedCountSession: 0, blockedCountTotal: 0 };
  vm.runInContext("render(state)", context);
  assert.match(elements.get("status-line").textContent, /10:00/);
  now += 12000;
  vm.runInContext("render(state)", context);
  assert.match(elements.get("status-line").textContent, /9:48/);
  now += 600000;
  vm.runInContext("render(state)", context);
  assert.equal(elements.get("status-line").textContent, "Blocking is ON (aggressive).");
});
