import type { RuleDefinition, RuleId, Task, TaskDependence } from "./types";

export interface TaskPolicy {
  label: string;
  dependence: TaskDependence;
  /** Signal quality (0–100) below this value counts as unreliable navigation for the task. */
  minSignalQuality: number;
  description: string;
}

export interface EngineConfig {
  version: string;
  taskPolicy: Record<Task, TaskPolicy>;
}

/**
 * Task policy. Thresholds are prototype defaults, documented on the Evidence & Method page
 * and configurable by passing a different EngineConfig to assess(). They are NOT validated
 * operational limits.
 */
export const DEFAULT_TASK_POLICY: Record<Task, TaskPolicy> = {
  routine: {
    label: "Routine fieldwork",
    dependence: "standard",
    minSignalQuality: 35,
    description: "Tillage, hauling, scouting. Tolerates metre-level drift.",
  },
  mapping: {
    label: "Mapping",
    dependence: "high",
    minSignalQuality: 60,
    description: "Boundary, yield or soil mapping. Errors persist in records.",
  },
  spraying: {
    label: "Precision spraying",
    dependence: "high",
    minSignalQuality: 65,
    description: "Section control and overlap avoidance rely on accurate passes.",
  },
  autonomous: {
    label: "Autonomous operation",
    dependence: "critical",
    minSignalQuality: 75,
    description: "Machine guidance depends directly on positioning.",
  },
};

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  version: "0.4",
  taskPolicy: DEFAULT_TASK_POLICY,
};

export const RULES: Record<RuleId, RuleDefinition> = {
  R1: {
    id: "R1",
    label: "Evidence gap",
    description:
      "Navigation evidence is missing, stale, unknown, or the receiver has no fix. No risk score is estimated.",
  },
  R2: {
    id: "R2",
    label: "Navigation unreliable",
    description:
      "Degraded health, an unstable or missing fix, or signal quality below the task threshold → verify positioning.",
  },
  R2A: {
    id: "R2A",
    label: "Autonomous safeguard",
    description:
      "Autonomous operation without confirmed reliable navigation → follow the approved safe fallback. Never continue.",
  },
  R3: {
    id: "R3",
    label: "Co-occurrence, not causation",
    description:
      "High exposure and unreliable navigation are both present. Reported side by side, never as cause and effect.",
  },
  R4: {
    id: "R4",
    label: "Exposure without degradation",
    description:
      "High exposure with healthy receiver evidence → monitor. Exposure alone does not establish degradation.",
  },
  R5: {
    id: "R5",
    label: "Investigate local causes",
    description:
      "Quiet space weather with unreliable navigation → check obstruction, interference, receiver and equipment.",
  },
  R6: {
    id: "R6",
    label: "Task sensitivity",
    description:
      "Mapping, spraying and autonomous work depend more on precise positioning and use stricter thresholds.",
  },
  R7: {
    id: "R7",
    label: "Indicator conflict",
    description: "Receiver indicators disagree; the more conservative reading is used.",
  },
  R8: {
    id: "R8",
    label: "Obstruction / interference flag",
    description: "An operator-reported obstruction or interference is treated as actionable evidence.",
  },
};

export const DISCLAIMER =
  "Decision support only. KhetSignal does not establish the cause of receiver behaviour, does not control machinery, and is not a safety certification. Follow your approved operating procedures.";
