import { DEFAULT_ENGINE_CONFIG, DISCLAIMER, type EngineConfig } from "./config";
import { EXPOSURE_LABEL, FIX_LABEL, FRESHNESS_LABEL, NAV_LABEL } from "./labels";
import type {
  Assessment,
  AssessmentInput,
  EvidenceStatus,
  Factor,
  FixStatus,
  NavHealth,
  Recommendation,
  RuleId,
  Severity,
} from "./types";

const SEVERITY_BY_RECOMMENDATION: Record<Recommendation, Severity> = {
  ROUTINE_MONITORING: "routine",
  MONITOR: "watch",
  VERIFY_POSITIONING: "elevated",
  SAFE_FALLBACK: "high",
  INSUFFICIENT_EVIDENCE: "gap",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Deterministic, conservative assessment. Same input → same output.
 * Space weather is only ever context; receiver observations are the evidence.
 * Never produces a numeric risk score or confidence value.
 */
export function assess(
  input: AssessmentInput,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG,
): Assessment {
  const policy = config.taskPolicy[input.task];
  const taskName = policy.label.toLowerCase();
  const highDependence = policy.dependence !== "standard";
  const autonomous = policy.dependence === "critical";
  const threshold = policy.minSignalQuality;

  const feedMissing = input.freshness === "missing";
  const feedStale = input.freshness === "stale";

  // Receiver-derived fields are ignored (not guessed) when the feed is missing.
  const nav: NavHealth = feedMissing ? "unknown" : input.navHealth;
  const fix: FixStatus = feedMissing ? "unreported" : input.fixStatus;
  const sq =
    feedMissing || input.signalQuality === null
      ? null
      : clamp(Math.round(input.signalQuality), 0, 100);

  // ---------- data quality ----------
  const missingFields: string[] = [];
  if (feedMissing) {
    missingFields.push("Receiver feed — navigation health, fix status and signal quality");
  } else {
    if (nav === "unknown") missingFields.push("Navigation health");
    if (fix === "unreported") missingFields.push("Fix status");
    if (sq === null) missingFields.push("Signal quality");
  }

  const signalLow = sq !== null && sq < threshold;

  const unreliable: string[] = [];
  if (nav === "degraded") unreliable.push("The receiver reports degraded navigation health.");
  if (fix === "unstable") unreliable.push("The position fix is unstable.");
  if (fix === "nofix") unreliable.push("The receiver reports no position fix.");
  if (signalLow)
    unreliable.push(
      `Signal quality ${sq} is below the ${threshold} threshold set for ${taskName}.`,
    );
  const navUnreliable = unreliable.length > 0;

  const hasReceiverEvidence =
    !feedMissing && (nav !== "unknown" || fix !== "unreported" || sq !== null);
  const hasActionable = hasReceiverEvidence || input.obstruction;
  const evidenceGap = feedMissing || feedStale || nav === "unknown" || fix === "nofix";

  const evidenceStatus: EvidenceStatus = !hasReceiverEvidence
    ? "insufficient"
    : feedStale || missingFields.length > 0
      ? "partial"
      : "sufficient";

  const qualityNotes: string[] = [];
  if (feedMissing)
    qualityNotes.push(
      "No receiver records in the assessment window. Receiver fields are ignored rather than estimated.",
    );
  else if (feedStale)
    qualityNotes.push(
      "Latest receiver records are older than the freshness window; current conditions may differ.",
    );
  else if (missingFields.length === 0)
    qualityNotes.push("Receiver records are current and all evidence fields are present.");
  else qualityNotes.push(`Receiver records are current; not reported: ${missingFields.join(", ").toLowerCase()}.`);
  qualityNotes.push(
    "Space-weather exposure is regional context and is not aligned to this receiver's exact position.",
  );

  // ---------- conflicts ----------
  const conflicts: string[] = [];
  if (nav === "healthy" && (fix === "unstable" || fix === "nofix"))
    conflicts.push(
      `Navigation health is reported healthy, but the fix is ${FIX_LABEL[fix].toLowerCase()}. The fix status takes priority.`,
    );
  if (nav === "healthy" && signalLow)
    conflicts.push(
      `Navigation health is reported healthy, but signal quality (${sq}) is below the ${threshold} threshold for ${taskName}.`,
    );
  if (nav === "degraded" && fix === "stable" && sq !== null && !signalLow)
    conflicts.push(
      "The receiver flags degraded health while fix and signal quality look acceptable. The degraded flag is kept.",
    );

  // ---------- rules ----------
  const rules: RuleId[] = [];
  const reasons: string[] = [];
  let recommendation: Recommendation;

  if (navUnreliable) {
    if (evidenceGap) rules.push("R1");
    rules.push("R2");
    reasons.push(...unreliable);
    if (feedStale) reasons.push("These readings are stale, so current conditions may differ.");
    if (input.exposure === "high") {
      rules.push("R3");
      reasons.push(
        "High space-weather exposure is present at the same time. Both are reported; neither is assumed to cause the other.",
      );
    } else if (input.exposure === "quiet") {
      rules.push("R5");
      reasons.push(
        "Space weather is quiet, so local causes — obstruction, interference, receiver or equipment issues — should be investigated.",
      );
    } else {
      reasons.push("Space-weather exposure is elevated and recorded as context, not as an explanation.");
    }
    if (input.obstruction) {
      rules.push("R8");
      reasons.push("An obstruction or interference flag was reported in the field.");
    }
    if (autonomous) {
      rules.push("R2A");
      reasons.push("Autonomous operation must not rely on navigation that is not confirmed reliable.");
      recommendation = "SAFE_FALLBACK";
    } else {
      recommendation = "VERIFY_POSITIONING";
    }
  } else if (evidenceGap) {
    rules.push("R1");
    if (feedMissing) {
      reasons.push("No receiver records were received, so navigation health cannot be assessed.");
    } else {
      if (feedStale) reasons.push("Receiver records are stale; the last reading may not reflect current conditions.");
      if (nav === "unknown") reasons.push("Navigation health is not reported by the receiver.");
    }
    if (input.obstruction) {
      rules.push("R8");
      reasons.push("An obstruction or interference flag was reported in the field.");
    }
    if (!hasActionable) {
      reasons.push("No actionable evidence is available, so no risk level is estimated.");
      recommendation = "INSUFFICIENT_EVIDENCE";
    } else {
      if (hasReceiverEvidence)
        reasons.push("Some receiver evidence exists but it is incomplete, so positioning should be verified before it is relied on.");
      recommendation = "VERIFY_POSITIONING";
    }
    if (autonomous) {
      rules.push("R2A");
      reasons.push("Autonomous operation requires confirmed, current navigation evidence.");
      recommendation = "SAFE_FALLBACK";
    }
  } else {
    // Current feed, healthy navigation, fix stable/unreported, signal acceptable/unreported.
    const unreported = missingFields.length
      ? `, though ${missingFields.join(" and ").toLowerCase()} ${missingFields.length > 1 ? "are" : "is"} not reported`
      : "";
    reasons.push(
      `Receiver evidence is current and shows no degradation${sq !== null ? ` (signal quality ${sq}, threshold ${threshold})` : ""}${unreported}.`,
    );
    if (input.exposure === "high") {
      rules.push("R4");
      reasons.push("Space-weather exposure is high. Exposure alone does not establish receiver degradation, so the situation is monitored.");
    } else if (input.exposure === "elevated") {
      reasons.push("Space-weather exposure is elevated and recorded as context.");
    }
    if (input.obstruction) {
      rules.push("R8");
      reasons.push("An obstruction or interference flag was reported in the field.");
    }
    if (autonomous && (evidenceStatus !== "sufficient" || input.obstruction)) {
      rules.push("R2A");
      reasons.push(
        evidenceStatus !== "sufficient"
          ? "Autonomous operation requires complete receiver evidence; fix status or signal quality is not reported."
          : "An obstruction or interference flag is present during autonomous operation.",
      );
      recommendation = "SAFE_FALLBACK";
    } else if (input.obstruction && highDependence) {
      recommendation = "VERIFY_POSITIONING";
    } else if (input.exposure === "high" || input.obstruction || highDependence) {
      recommendation = "MONITOR";
    } else {
      recommendation = "ROUTINE_MONITORING";
    }
  }

  if (highDependence) {
    rules.push("R6");
    reasons.push(
      `${policy.label} depends ${autonomous ? "critically" : "heavily"} on precise positioning, so a stricter signal threshold (${threshold}) applies.`,
    );
  }
  if (conflicts.length) rules.push("R7");

  // ---------- narrative ----------
  const summary = buildSummary(recommendation, rules, {
    exposureHigh: input.exposure === "high",
    obstruction: input.obstruction,
    highDependence,
    taskLabel: policy.label,
    navUnreliable,
  });

  const nextStep = buildNextStep(recommendation, rules, {
    feedStale,
    highDependence,
    taskName,
    threshold,
    autonomous,
    exposureHigh: input.exposure === "high",
  });

  const observed: string[] = [
    `Space-weather exposure: ${EXPOSURE_LABEL[input.exposure]} (context only).`,
  ];
  if (feedMissing) observed.push("Receiver feed: no records received in the assessment window.");
  else {
    observed.push(
      `Navigation health: ${NAV_LABEL[nav]} · fix: ${FIX_LABEL[fix]} · signal quality: ${sq ?? "not reported"}.`,
    );
    observed.push(`Data freshness: ${FRESHNESS_LABEL[input.freshness]}.`);
  }
  observed.push(`Task: ${policy.label} (${policy.dependence} positioning dependence).`);
  if (input.obstruction) observed.push("Field report: obstruction or interference flagged.");

  const notProven: string[] = [];
  if (rules.includes("R3"))
    notProven.push("That high exposure caused the degraded navigation. Co-occurrence is not causation.");
  else if (input.exposure !== "quiet" && !navUnreliable && hasReceiverEvidence)
    notProven.push("That space weather is affecting this receiver. Exposure alone does not establish degradation.");
  else if (input.exposure === "quiet" && navUnreliable)
    notProven.push("What is causing the degradation. Quiet space weather neither confirms nor rules out any cause.");
  else notProven.push("That space weather has caused, or will cause, any receiver behaviour.");
  if (!hasReceiverEvidence)
    notProven.push("That navigation is healthy — or degraded. Missing data is not evidence either way.");
  if (recommendation === "MONITOR" || recommendation === "ROUTINE_MONITORING")
    notProven.push("That positioning will stay accurate for the whole operation.");
  notProven.push("That any machine or operation is safe. This is not a safety certification.");

  const factors: Factor[] = [
    {
      id: "exposure",
      label: "Space-weather exposure",
      value: EXPOSURE_LABEL[input.exposure],
      role: "context",
      effect: input.exposure === "high" ? "raises" : "neutral",
      note:
        input.exposure === "high"
          ? "Raises monitoring level. Never treated as proof of receiver impact."
          : "Recorded as context only.",
    },
    {
      id: "navHealth",
      label: "Navigation health",
      value: feedMissing ? "—" : NAV_LABEL[input.navHealth],
      role: "evidence",
      effect: feedMissing ? "ignored" : nav === "degraded" ? "raises" : nav === "healthy" ? "supports" : "gap",
      note: feedMissing
        ? "Ignored: receiver feed missing."
        : nav === "degraded"
          ? "Direct evidence of unreliable navigation."
          : nav === "healthy"
            ? "Receiver reports healthy navigation."
            : "Not reported — counted as an evidence gap.",
    },
    {
      id: "fixStatus",
      label: "Fix status",
      value: feedMissing ? "—" : FIX_LABEL[input.fixStatus],
      role: "evidence",
      effect: feedMissing
        ? "ignored"
        : fix === "stable"
          ? "supports"
          : fix === "unreported"
            ? "gap"
            : "raises",
      note: feedMissing
        ? "Ignored: receiver feed missing."
        : fix === "stable"
          ? "Consistent position fix."
          : fix === "unreported"
            ? "Optional field not supplied."
            : "Fix is not reliable for precise work.",
    },
    {
      id: "signalQuality",
      label: "Signal quality",
      value: feedMissing ? "—" : sq === null ? "Not reported" : `${sq} / 100`,
      role: "evidence",
      effect: feedMissing ? "ignored" : sq === null ? "gap" : signalLow ? "raises" : "supports",
      note: feedMissing
        ? "Ignored: receiver feed missing."
        : sq === null
          ? "Optional field not supplied."
          : `Task threshold ${threshold}. ${signalLow ? "Below threshold." : "At or above threshold."}`,
    },
    {
      id: "freshness",
      label: "Data freshness",
      value: FRESHNESS_LABEL[input.freshness],
      role: "quality",
      effect: input.freshness === "current" ? "supports" : "gap",
      note:
        input.freshness === "current"
          ? "Within freshness window."
          : input.freshness === "stale"
            ? "Older than freshness window."
            : "No records received.",
    },
    {
      id: "task",
      label: "Agricultural task",
      value: policy.label,
      role: "policy",
      effect: highDependence ? "raises" : "neutral",
      note: `${policy.dependence.charAt(0).toUpperCase()}${policy.dependence.slice(1)} positioning dependence · threshold ${threshold}.`,
    },
    {
      id: "obstruction",
      label: "Obstruction / interference",
      value: input.obstruction ? "Flagged" : "None reported",
      role: "evidence",
      effect: input.obstruction ? "raises" : "neutral",
      note: input.obstruction ? "Operator-reported; actionable." : "No field report.",
    },
  ];

  return {
    recommendation,
    severity: SEVERITY_BY_RECOMMENDATION[recommendation],
    summary,
    reasons,
    observed,
    notProven,
    nextStep,
    conflicts,
    evidenceStatus,
    missingFields,
    qualityNotes,
    factors,
    rules,
    disclaimer: DISCLAIMER,
  };
}

function buildSummary(
  rec: Recommendation,
  rules: RuleId[],
  c: {
    exposureHigh: boolean;
    obstruction: boolean;
    highDependence: boolean;
    taskLabel: string;
    navUnreliable: boolean;
  },
): string {
  switch (rec) {
    case "INSUFFICIENT_EVIDENCE":
      return "Receiver data is unavailable. There is not enough evidence to assess navigation health, so no risk level is estimated.";
    case "SAFE_FALLBACK":
      return "Navigation cannot be confirmed reliable for autonomous operation. Follow your approved safe fallback procedure.";
    case "VERIFY_POSITIONING":
      if (rules.includes("R3"))
        return "High space-weather exposure and degraded navigation are both present. Verify positioning — without assuming one caused the other.";
      if (rules.includes("R5"))
        return "Navigation is degraded while space weather is quiet. Verify positioning and investigate local causes.";
      if (!c.navUnreliable && rules.includes("R1"))
        return "Receiver evidence is incomplete or stale. Verify positioning before relying on it.";
      if (!c.navUnreliable && c.obstruction)
        return `An obstruction or interference flag is present during ${c.taskLabel.toLowerCase()}. Verify positioning.`;
      return "Navigation evidence shows degradation. Verify positioning before relying on GNSS guidance.";
    case "MONITOR":
      if (c.exposureHigh)
        return "Space-weather exposure is high, but receiver evidence shows no degradation. Monitor navigation health.";
      if (c.obstruction)
        return "Navigation looks healthy, but an obstruction or interference flag is present. Monitor.";
      return `Navigation looks healthy. ${c.taskLabel} relies on precise positioning, so keep monitoring.`;
    case "ROUTINE_MONITORING":
      return "Receiver evidence is current and healthy for routine fieldwork. Routine monitoring is sufficient.";
  }
}

function buildNextStep(
  rec: Recommendation,
  rules: RuleId[],
  c: {
    feedStale: boolean;
    highDependence: boolean;
    taskName: string;
    threshold: number;
    autonomous: boolean;
    exposureHigh: boolean;
  },
): string {
  switch (rec) {
    case "INSUFFICIENT_EVIDENCE":
      return "Restore or refresh the receiver feed, then re-run the assessment. Until then, do not rely on GNSS for precision-dependent work; use your approved procedures.";
    case "SAFE_FALLBACK":
      return "Do not rely on autonomous guidance. Follow your approved safe fallback procedure, then verify positioning against a known reference. Any resumption is decided under your approved procedures, not by this tool.";
    case "VERIFY_POSITIONING": {
      const parts: string[] = [];
      if (c.feedStale) parts.push("Refresh receiver data first.");
      parts.push("Check position against a known reference point before relying on GNSS guidance.");
      if (rules.includes("R5") || rules.includes("R8"))
        parts.push("Inspect for obstruction (tree lines, structures), local interference, antenna and cable condition, and receiver configuration.");
      if (c.highDependence)
        parts.push(`If verification fails, switch to your approved fallback procedure for ${c.taskName}.`);
      return parts.join(" ");
    }
    case "MONITOR":
      return c.autonomous
        ? "Operate only under your approved supervision procedures with the safe fallback ready. Re-assess immediately if the fix becomes unstable or signal quality drops below " +
            c.threshold +
            "."
        : `Proceed under normal procedures while watching fix status and signal quality. Re-assess if signal quality drops below ${c.threshold} or the fix becomes unstable.`;
    case "ROUTINE_MONITORING":
      return "No additional action indicated. Re-assess if receiver evidence or the task changes.";
  }
}
