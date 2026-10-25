/** Environmental exposure — space-weather context. Never treated as proof of receiver impact. */
export type Exposure = "quiet" | "elevated" | "high";

/** Observed navigation health reported by the receiver (evidence). */
export type NavHealth = "healthy" | "degraded" | "unknown";

/** Freshness of receiver records relative to the assessment window. */
export type Freshness = "current" | "stale" | "missing";

/** Agricultural task — determines how much the operation depends on precise positioning. */
export type Task = "routine" | "mapping" | "spraying" | "autonomous";

/** Receiver fix status. "unreported" = optional field not supplied. */
export type FixStatus = "stable" | "unstable" | "nofix" | "unreported";

export interface AssessmentInput {
  exposure: Exposure;
  navHealth: NavHealth;
  freshness: Freshness;
  task: Task;
  /** 0–100, or null when the receiver does not report it. */
  signalQuality: number | null;
  fixStatus: FixStatus;
  /** Operator-reported obstruction or interference in the field. */
  obstruction: boolean;
}

export type Recommendation =
  | "ROUTINE_MONITORING"
  | "MONITOR"
  | "VERIFY_POSITIONING"
  | "SAFE_FALLBACK"
  | "INSUFFICIENT_EVIDENCE";

export type Severity = "routine" | "watch" | "elevated" | "high" | "gap";

export type EvidenceStatus = "sufficient" | "partial" | "insufficient";

export type TaskDependence = "standard" | "high" | "critical";

export type FactorRole = "context" | "evidence" | "quality" | "policy";

export type FactorEffect = "raises" | "supports" | "neutral" | "gap" | "ignored";

export interface Factor {
  id: keyof AssessmentInput;
  label: string;
  value: string;
  role: FactorRole;
  effect: FactorEffect;
  note: string;
}

export type RuleId = "R1" | "R2" | "R2A" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8";

export interface RuleDefinition {
  id: RuleId;
  label: string;
  description: string;
}

export interface Assessment {
  recommendation: Recommendation;
  severity: Severity;
  summary: string;
  reasons: string[];
  observed: string[];
  notProven: string[];
  nextStep: string;
  conflicts: string[];
  evidenceStatus: EvidenceStatus;
  missingFields: string[];
  qualityNotes: string[];
  factors: Factor[];
  rules: RuleId[];
  disclaimer: string;
}
