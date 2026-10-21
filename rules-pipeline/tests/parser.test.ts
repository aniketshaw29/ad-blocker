import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWithReport, normalizeRules } from "../src/normalize";
import { compileToDnr } from "../src/compile";
import { validateDnrRules } from "../src/validate";
import { selectRulesWithinBudget } from "../src/compile/budget";

const overrides = { allow: [], block: [], remove: [] };
const rows = (...filters: string[]) => filters.map((raw) => ({ raw, sourceId: "fixture" }));

test("deduplicates canonical domains and compiles without filter-list syntax", () => {
  const { rules, report } = normalizeWithReport(rows("||Ads.Example.com^", "||ads.example.com^"), overrides);
  assert.equal(report.duplicates, 1);
  const compiled = compileToDnr(rules);
  validateDnrRules(compiled);
  assert.equal(compiled[0].condition.urlFilter, "||ads.example.com^");
});

test("rejects options, paths, regex and cosmetic syntax rather than broadening them", () => {
  const { rules, report } = normalizeWithReport(rows("||ads.example.com^$redirect=noop.js",
    "||ads.example.com/path", "/ad[s]?/", "example.com##.ad", "||bad..example^"), overrides);
  assert.equal(rules.length, 0);
  assert.equal(report.unsupported, 5);
});

test("scoped exceptions conservatively suppress overlapping domain blocks", () => {
  const rules = normalizeRules(rows("||example.com^", "||ads.example.com^",
    "@@||ads.example.com^$domain=site.test", "||unrelated.test^"), overrides);
  assert.deepEqual(rules.map((rule) => rule.filter), ["||unrelated.test^"]);
});

test("uninterpretable exceptions suppress source blocks but retain curated overrides", () => {
  const rules = normalizeRules(rows("||example.com^", "@@/exception/"),
    { ...overrides, block: ["||curated.example^"] });
  assert.deepEqual(rules.map((rule) => rule.filter), ["||curated.example^"]);
});

test("allow/remove overrides exclude rules and malformed curated rules fail loudly", () => {
  assert.equal(normalizeRules(rows("||ads.example.com^"),
    { ...overrides, allow: ["||example.com^"] }).length, 0);
  assert.equal(normalizeRules(rows("||ads.example.com^"),
    { ...overrides, remove: ["||ads.example.com^"] }).length, 0);
  assert.throws(() => normalizeRules([], { ...overrides, block: ["||example.com^$unknown"] }), /Unsupported/);
});

test("resource, party, and initiator restrictions survive compilation", () => {
  const rules = normalizeRules(rows("||ads.example.com^$script,third-party,domain=site.test|~private.site.test"), overrides);
  const [compiled] = compileToDnr(rules);
  assert.deepEqual(compiled.condition, {
    urlFilter: "||ads.example.com^", resourceTypes: ["script"],
    domainType: "thirdParty", initiatorDomains: ["site.test"],
    excludedInitiatorDomains: ["private.site.test"]
  });
});

test("negated resource and party options retain their meaning", () => {
  const [compiled] = compileToDnr(normalizeRules(rows("||ads.example.com^$~image,~third-party"), overrides));
  assert.equal(compiled.condition.domainType, "firstParty");
  assert.ok(!compiled.condition.resourceTypes.includes("image"));
  assert.ok(compiled.condition.resourceTypes.includes("script"));
});

test("unknown, contradictory, and invalid scoped options reject the entire filter", () => {
  const { rules, report } = normalizeWithReport(rows("||ads.example.com^$script,~script",
    "||ads.example.com^$domain=", "||ads.example.com^$script,redirect=noop",
    "||ads.example.com^$third-party,~third-party"), overrides);
  assert.equal(rules.length, 0);
  assert.equal(report.unsupported, 4);
});

test("path-specific domain exceptions exclude only overlapping target domains", () => {
  const { rules, report } = normalizeWithReport(rows("||ads.example.com^", "||unrelated.test^",
    "@@||ads.example.com/player.js$script"), overrides);
  assert.deepEqual(rules.map((rule) => rule.filter), ["||unrelated.test^"]);
  assert.equal(report.exceptionCount, 1);
});

test("generic path exceptions project positive initiators without disabling all source blocks", () => {
  const [compiled] = compileToDnr(normalizeRules(rows("||ads.example.com^",
    "@@/allowed.js$script,domain=site.test|shop.test"), overrides));
  assert.deepEqual(compiled.condition.excludedInitiatorDomains, ["shop.test", "site.test"]);
  assert.ok(compiled.condition.resourceTypes.includes("script"));
});

test("unscoped path exception conservatively removes affected resource types", () => {
  const [compiled] = compileToDnr(normalizeRules(rows("||ads.example.com^",
    "@@/allowed.js$script,~third-party"), overrides));
  assert.ok(!compiled.condition.resourceTypes.includes("script"));
  assert.ok(compiled.condition.resourceTypes.includes("image"));
});

test("cosmetic exceptions do not suppress network blocking", () => {
  assert.equal(normalizeRules(rows("||ads.example.com^", "@@$generichide,domain=site.test"), overrides).length, 1);
});

test("wildcard host exceptions preserve unrelated blocks", () => {
  const rules = normalizeRules(rows("||coremetrics.com^", "||unrelated.test^",
    "@@||coremetrics.com*/eluminate.js"), overrides);
  assert.deepEqual(rules.map((rule) => rule.filter), ["||unrelated.test^"]);
});

test("budget prioritizes curated filters and reports deferred rules deterministically", () => {
  const rules = normalizeRules(rows("||a.test^", "||analytics.test^"),
    { ...overrides, block: ["||z.test^"] });
  const { selected, deferred } = selectRulesWithinBudget(rules, 2);
  assert.deepEqual(selected.map((rule) => rule.filter), ["||z.test^", "||analytics.test^"]);
  assert.equal(deferred, 1);
  assert.deepEqual(selectRulesWithinBudget([...rules].reverse(), 2).selected, selected);
  assert.throws(() => selectRulesWithinBudget(rules, 0), /budget/);
  const duplicate = normalizeRules(rows("||z.test^"), { ...overrides, block: ["||z.test^"] });
  assert.equal(duplicate[0].sourceId, "override");
});
