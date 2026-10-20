import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWithReport, normalizeRules } from "../src/normalize";
import { compileToDnr } from "../src/compile";
import { validateDnrRules } from "../src/validate";

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
