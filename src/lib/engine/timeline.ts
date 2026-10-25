import { DEFAULT_TASK_POLICY } from "./config";
import type { AssessmentInput, Exposure, FixStatus } from "./types";

export interface TimelinePoint {
  minute: number;
  label: string;
  signal: number | null;
  fix: FixStatus | "none";
  exposure: Exposure;
}

export interface Timeline {
  points: TimelinePoint[];
  threshold: number;
  /** Minute after which no receiver records exist (stale/missing), else null. */
  feedEndsAt: number | null;
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function exposureAt(level: Exposure, m: number): Exposure {
  if (level === "high") return m < -100 ? "quiet" : m < -60 ? "elevated" : "high";
  if (level === "elevated") return m < -70 ? "quiet" : "elevated";
  return "quiet";
}

/**
 * Illustrative 2-hour series derived deterministically from the scenario inputs.
 * SIMULATED: used only to visualise the inputs, never as an input to the engine.
 */
export function buildTimeline(input: AssessmentInput): Timeline {
  const rand = rng(hash(JSON.stringify(input)));
  const threshold = DEFAULT_TASK_POLICY[input.task].minSignalQuality;
  const feedEndsAt =
    input.freshness === "missing" ? -120 : input.freshness === "stale" ? -45 : null;

  const target =
    input.signalQuality ??
    (input.navHealth === "healthy" ? 84 : input.navHealth === "degraded" ? 46 : 70);
  const start = Math.max(target, 82);
  const noise = input.fixStatus === "unstable" || input.fixStatus === "nofix" ? 7 : 2.5;

  const points: TimelinePoint[] = [];
  for (let m = -120; m <= 0; m += 5) {
    const progress = m < -50 ? 0 : (m + 50) / 50;
    const base = start + (target - start) * progress;
    let signal: number | null =
      input.signalQuality === null && input.navHealth === "unknown"
        ? null
        : Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 2 * noise)));
    if (m === 0 && signal !== null && input.signalQuality !== null) signal = input.signalQuality;
    if (input.signalQuality === null) signal = null;

    let fix: TimelinePoint["fix"] = "stable";
    if (input.fixStatus === "unreported") fix = "none";
    else if (input.fixStatus === "unstable") fix = m >= -40 && (rand() > 0.4 || m === 0) ? "unstable" : "stable";
    else if (input.fixStatus === "nofix") fix = m >= -20 ? "nofix" : m >= -45 ? "unstable" : "stable";

    if (feedEndsAt !== null && m > feedEndsAt) {
      signal = null;
      fix = "none";
    }
    if (input.freshness === "missing") {
      signal = null;
      fix = "none";
    }

    points.push({
      minute: m,
      label: m === 0 ? "now" : `${m}m`,
      signal,
      fix,
      exposure: exposureAt(input.exposure, m),
    });
  }
  return { points, threshold, feedEndsAt };
}
