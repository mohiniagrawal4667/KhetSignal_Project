import { DEFAULT_TASK_POLICY } from "./config";
import type {
  EvidenceStatus,
  Exposure,
  FixStatus,
  Freshness,
  NavHealth,
  Recommendation,
  Severity,
  Task,
} from "./types";

export const EXPOSURE_OPTIONS: Exposure[] = ["quiet", "elevated", "high"];
export const NAV_OPTIONS: NavHealth[] = ["healthy", "degraded", "unknown"];
export const FRESHNESS_OPTIONS: Freshness[] = ["current", "stale", "missing"];
export const TASK_OPTIONS: Task[] = ["routine", "mapping", "spraying", "autonomous"];
export const FIX_OPTIONS: FixStatus[] = ["stable", "unstable", "nofix", "unreported"];

export const EXPOSURE_LABEL: Record<Exposure, string> = {
  quiet: "Quiet",
  elevated: "Elevated",
  high: "High",
};

export const NAV_LABEL: Record<NavHealth, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unknown: "Unknown",
};

export const FRESHNESS_LABEL: Record<Freshness, string> = {
  current: "Current",
  stale: "Stale",
  missing: "Missing",
};

export const FRESHNESS_DETAIL: Record<Freshness, string> = {
  current: "Records within the last 5 min",
  stale: "Last record older than 45 min",
  missing: "No records in window",
};

export const FIX_LABEL: Record<FixStatus, string> = {
  stable: "Stable",
  unstable: "Unstable",
  nofix: "No fix",
  unreported: "Not reported",
};

export const TASK_LABEL: Record<Task, string> = {
  routine: DEFAULT_TASK_POLICY.routine.label,
  mapping: DEFAULT_TASK_POLICY.mapping.label,
  spraying: DEFAULT_TASK_POLICY.spraying.label,
  autonomous: DEFAULT_TASK_POLICY.autonomous.label,
};

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  ROUTINE_MONITORING: "Routine monitoring",
  MONITOR: "Monitor",
  VERIFY_POSITIONING: "Verify positioning",
  SAFE_FALLBACK: "Follow approved safe fallback",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  routine: "Routine",
  watch: "Watch",
  elevated: "Elevated attention",
  high: "High attention",
  gap: "Evidence gap",
};

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  sufficient: "Complete",
  partial: "Partial",
  insufficient: "Insufficient",
};
