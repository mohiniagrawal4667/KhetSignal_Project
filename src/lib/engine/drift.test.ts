import { describe, expect, it } from "vitest";
import { estimateDrift, getPreset, TASK_TOLERANCE_CM } from "./index";

describe("drift visual", () => {
  it("task tolerances", () => {
    expect(TASK_TOLERANCE_CM).toEqual({ autonomous: 5, spraying: 10, mapping: 25, routine: 50 });
  });
  it("A healthy stays locked within tolerance", () => {
    const d = estimateDrift(getPreset("A").input);
    expect(d.mode).toBe("locked");
    expect(d.errorCm).toBe(2);
  });
  it("B degraded exceeds spraying limit", () => {
    expect(estimateDrift(getPreset("B").input).exceeds).toBe(true);
  });
  it("D missing is lost with no value", () => {
    const d = estimateDrift(getPreset("D").input);
    expect(d.mode).toBe("lost");
    expect(d.errorCm).toBeNull();
  });
});
