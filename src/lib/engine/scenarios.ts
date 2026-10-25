import type { AssessmentInput } from "./types";

export type PresetId = "A" | "B" | "C" | "D" | "E";

export interface ScenarioPreset {
  id: PresetId;
  title: string;
  short: string;
  description: string;
  input: AssessmentInput;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "A",
    title: "Elevated space weather · Healthy GNSS",
    short: "Elevated · Healthy",
    description: "Exposure is elevated during field mapping, but the receiver shows a stable, strong fix.",
    input: {
      exposure: "elevated",
      navHealth: "healthy",
      freshness: "current",
      task: "mapping",
      signalQuality: 84,
      fixStatus: "stable",
      obstruction: false,
    },
  },
  {
    id: "B",
    title: "High exposure · Degraded GNSS",
    short: "High · Degraded",
    description: "High exposure while the receiver reports degraded health and an unstable fix during spraying.",
    input: {
      exposure: "high",
      navHealth: "degraded",
      freshness: "current",
      task: "spraying",
      signalQuality: 48,
      fixStatus: "unstable",
      obstruction: false,
    },
  },
  {
    id: "C",
    title: "Quiet space weather · Poor GNSS",
    short: "Quiet · Poor",
    description: "Space weather is quiet but navigation is poor near a tree line. Local causes are likely candidates.",
    input: {
      exposure: "quiet",
      navHealth: "degraded",
      freshness: "current",
      task: "mapping",
      signalQuality: 41,
      fixStatus: "unstable",
      obstruction: true,
    },
  },
  {
    id: "D",
    title: "Receiver data unavailable",
    short: "Data unavailable",
    description: "The receiver feed has dropped. No navigation evidence is available for spraying.",
    input: {
      exposure: "elevated",
      navHealth: "unknown",
      freshness: "missing",
      task: "spraying",
      signalQuality: null,
      fixStatus: "unreported",
      obstruction: false,
    },
  },
  {
    id: "E",
    title: "Autonomous operation · Unstable fix",
    short: "Autonomous · Unstable",
    description: "An autonomous run with an unstable fix and below-threshold signal quality.",
    input: {
      exposure: "elevated",
      navHealth: "degraded",
      freshness: "current",
      task: "autonomous",
      signalQuality: 63,
      fixStatus: "unstable",
      obstruction: false,
    },
  },
];

export const DEFAULT_PRESET_ID: PresetId = "B";

export function getPreset(id: PresetId): ScenarioPreset {
  const p = SCENARIO_PRESETS.find((s) => s.id === id);
  if (!p) throw new Error(`Unknown preset ${id}`);
  return p;
}

export const DEFAULT_INPUT: AssessmentInput = getPreset(DEFAULT_PRESET_ID).input;

export function matchPreset(input: AssessmentInput): PresetId | null {
  const hit = SCENARIO_PRESETS.find((p) =>
    (Object.keys(p.input) as (keyof AssessmentInput)[]).every((k) => p.input[k] === input[k]),
  );
  return hit?.id ?? null;
}
