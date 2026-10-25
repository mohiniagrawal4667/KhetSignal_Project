import { describe, expect, it } from "vitest";

import { assess } from "./assess";
import { explainChange } from "./compare";
import { getPreset } from "./scenarios";
import type { AssessmentInput } from "./types";

const healthy: AssessmentInput = {
  exposure: "quiet",
  navHealth: "healthy",
  freshness: "current",
  task: "routine",
  signalQuality: 85,
  fixStatus: "stable",
  obstruction: false,
};

const run = (patch: Partial<AssessmentInput>) => assess({ ...healthy, ...patch });

describe("Rule 1 — missing / stale / unknown evidence", () => {
  it("returns INSUFFICIENT EVIDENCE when the receiver feed is missing and nothing else is actionable", () => {
    const a = run({ freshness: "missing", navHealth: "unknown", signalQuality: null, fixStatus: "unreported", task: "spraying" });
    expect(a.recommendation).toBe("INSUFFICIENT_EVIDENCE");
    expect(a.evidenceStatus).toBe("insufficient");
  });

  it("ignores receiver fields when the feed is missing, even if they look healthy", () => {
    expect(run({ freshness: "missing" }).recommendation).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("returns VERIFY POSITIONING when the feed is missing but an obstruction is reported", () => {
    expect(run({ freshness: "missing", obstruction: true }).recommendation).toBe("VERIFY_POSITIONING");
  });

  it("returns VERIFY POSITIONING for stale but otherwise healthy readings", () => {
    expect(run({ freshness: "stale" }).recommendation).toBe("VERIFY_POSITIONING");
  });

  it("returns VERIFY POSITIONING when the receiver reports no fix", () => {
    expect(run({ fixStatus: "nofix", task: "mapping" }).recommendation).toBe("VERIFY_POSITIONING");
  });

  it("never returns a numeric score", () => {
    const a = run({ freshness: "missing" }) as unknown as Record<string, unknown>;
    expect(Object.values(a).some((v) => typeof v === "number")).toBe(false);
  });
});

describe("Rule 2 — unreliable navigation", () => {
  it("returns VERIFY POSITIONING when navigation is degraded", () => {
    expect(run({ navHealth: "degraded", task: "mapping" }).recommendation).toBe("VERIFY_POSITIONING");
  });

  it("returns VERIFY POSITIONING when signal quality is below the mapping threshold of 60", () => {
    expect(run({ task: "mapping", signalQuality: 59 }).recommendation).toBe("VERIFY_POSITIONING");
    expect(run({ task: "mapping", signalQuality: 60 }).recommendation).toBe("MONITOR");
  });

  it("returns FOLLOW APPROVED SAFE FALLBACK for autonomous operation with an unstable fix", () => {
    const a = run({ task: "autonomous", fixStatus: "unstable" });
    expect(a.recommendation).toBe("SAFE_FALLBACK");
    expect(a.nextStep.toLowerCase()).not.toContain("continue");
  });

  it("returns FOLLOW APPROVED SAFE FALLBACK for autonomous operation when evidence is missing", () => {
    expect(run({ task: "autonomous", freshness: "missing" }).recommendation).toBe("SAFE_FALLBACK");
  });
});

describe("Rule 3 — high exposure + degraded navigation", () => {
  it("verifies positioning, names both, and refuses causation", () => {
    const a = run({ exposure: "high", navHealth: "degraded", task: "spraying" });
    expect(a.recommendation).toBe("VERIFY_POSITIONING");
    expect(a.rules).toContain("R3");
    expect(a.nextStep.toLowerCase()).toContain("fallback");
    expect(a.notProven.join(" ").toLowerCase()).toContain("not causation");
  });
});

describe("Rule 4 — high exposure + healthy navigation", () => {
  it("returns MONITOR and says exposure alone does not establish degradation", () => {
    const a = run({ exposure: "high" });
    expect(a.recommendation).toBe("MONITOR");
    expect(a.reasons.join(" ")).toContain("Exposure alone does not establish receiver degradation");
  });
});

describe("Rule 5 — quiet exposure + degraded navigation", () => {
  it("verifies positioning and points to local causes", () => {
    const a = run({ navHealth: "degraded", task: "mapping" });
    expect(a.recommendation).toBe("VERIFY_POSITIONING");
    expect(a.rules).toContain("R5");
    expect(a.nextStep.toLowerCase()).toContain("interference");
    expect(a.nextStep.toLowerCase()).toContain("obstruction");
  });
});

describe("Rule 6 — task sensitivity", () => {
  it("routine fieldwork with healthy navigation gets ROUTINE MONITORING", () => {
    expect(run({}).recommendation).toBe("ROUTINE_MONITORING");
  });

  it("precision spraying with the same healthy navigation gets MONITOR", () => {
    expect(run({ task: "spraying" }).recommendation).toBe("MONITOR");
  });
});

describe("Scenario presets", () => {
  it.each([
    ["A", "MONITOR"],
    ["B", "VERIFY_POSITIONING"],
    ["C", "VERIFY_POSITIONING"],
    ["D", "INSUFFICIENT_EVIDENCE"],
    ["E", "SAFE_FALLBACK"],
  ] as const)("preset %s → %s", (id, expected) => {
    expect(assess(getPreset(id).input).recommendation).toBe(expected);
  });

  it("explains the change from preset A to preset B", () => {
    const a = getPreset("A").input;
    const b = getPreset("B").input;
    const c = explainChange(a, assess(a), b, assess(b));
    expect(c.recommendationChanged).toBe(true);
    expect(c.changes.map((x) => x.field)).toContain("navHealth");
  });
});
