import { RULES } from "./config";
import {
  EXPOSURE_LABEL,
  FIX_LABEL,
  FRESHNESS_LABEL,
  NAV_LABEL,
  RECOMMENDATION_LABEL,
  TASK_LABEL,
} from "./labels";
import type { Assessment, AssessmentInput } from "./types";

export interface InputChange {
  field: keyof AssessmentInput;
  label: string;
  from: string;
  to: string;
}

export interface ChangeExplanation {
  changes: InputChange[];
  recommendationChanged: boolean;
  explanation: string[];
}

const FIELD_LABEL: Record<keyof AssessmentInput, string> = {
  exposure: "Space-weather exposure",
  navHealth: "Navigation health",
  freshness: "Data freshness",
  task: "Task",
  signalQuality: "Signal quality",
  fixStatus: "Fix status",
  obstruction: "Obstruction / interference",
};

export function formatInputValue<K extends keyof AssessmentInput>(
  field: K,
  value: AssessmentInput[K],
): string {
  switch (field) {
    case "exposure":
      return EXPOSURE_LABEL[value as AssessmentInput["exposure"]];
    case "navHealth":
      return NAV_LABEL[value as AssessmentInput["navHealth"]];
    case "freshness":
      return FRESHNESS_LABEL[value as AssessmentInput["freshness"]];
    case "task":
      return TASK_LABEL[value as AssessmentInput["task"]];
    case "fixStatus":
      return FIX_LABEL[value as AssessmentInput["fixStatus"]];
    case "signalQuality":
      return value === null ? "Not reported" : String(value);
    case "obstruction":
      return value ? "Flagged" : "None";
    default:
      return String(value);
  }
}

export function diffInputs(a: AssessmentInput, b: AssessmentInput): InputChange[] {
  return (Object.keys(FIELD_LABEL) as (keyof AssessmentInput)[])
    .filter((k) => a[k] !== b[k])
    .map((k) => ({
      field: k,
      label: FIELD_LABEL[k],
      from: formatInputValue(k, a[k]),
      to: formatInputValue(k, b[k]),
    }));
}

/** Explain, in plain language, why the recommendation moved between two assessments. */
export function explainChange(
  prevInput: AssessmentInput,
  prev: Assessment,
  nextInput: AssessmentInput,
  next: Assessment,
): ChangeExplanation {
  const changes = diffInputs(prevInput, nextInput);
  const recommendationChanged = prev.recommendation !== next.recommendation;
  const explanation: string[] = [];
  if (changes.length === 0) return { changes, recommendationChanged, explanation };

  const added = next.rules.filter((r) => !prev.rules.includes(r));
  const removed = prev.rules.filter((r) => !next.rules.includes(r));

  if (recommendationChanged) {
    explanation.push(
      `Recommendation moved from ${RECOMMENDATION_LABEL[prev.recommendation]} to ${RECOMMENDATION_LABEL[next.recommendation]}.`,
    );
  } else {
    explanation.push(
      `Recommendation unchanged: ${RECOMMENDATION_LABEL[next.recommendation]}.`,
    );
  }
  for (const r of added) explanation.push(`Now applies — ${RULES[r].label}: ${RULES[r].description}`);
  for (const r of removed) explanation.push(`No longer applies — ${RULES[r].label}.`);
  if (!added.length && !removed.length)
    explanation.push("The changed inputs did not alter which rules apply.");

  return { changes, recommendationChanged, explanation };
}
