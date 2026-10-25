import type { AssessmentInput, Task } from "./types";

/** Illustrative cross-track tolerance per task, in centimetres. */
export const TASK_TOLERANCE_CM: Record<Task, number> = {
  autonomous: 5,
  spraying: 10,
  mapping: 25,
  routine: 50,
};

export interface DriftEstimate {
  /** Illustrative cross-track error in cm, or null when telemetry is missing. */
  errorCm: number | null;
  toleranceCm: number;
  mode: "locked" | "drifting" | "lost";
  exceeds: boolean;
}

/**
 * Illustrative swath error derived from the scenario inputs. This is a visual
 * aid only — not a measurement and not used by the decision engine.
 */
export function estimateDrift(input: AssessmentInput): DriftEstimate {
  const toleranceCm = TASK_TOLERANCE_CM[input.task];
  if (input.freshness === "missing") return { errorCm: null, toleranceCm, mode: "lost", exceeds: false };

  const sq = input.signalQuality ?? 60;
  let err: number;
  if (input.fixStatus === "nofix") err = 120;
  else if (input.navHealth === "healthy" && input.fixStatus !== "unstable") err = 2;
  else if (input.navHealth === "unknown") err = 30;
  else err = Math.round((100 - sq) * 0.9);
  if (input.fixStatus === "unstable") err = Math.max(err, 18);
  if (input.obstruction) err += 8;
  if (input.freshness === "stale") err += 5;

  const exceeds = err > toleranceCm;
  return { errorCm: err, toleranceCm, mode: err <= 5 && !exceeds ? "locked" : "drifting", exceeds };
}
