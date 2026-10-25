import { Eye, SatelliteDish, ShieldCheck, SunMedium, Tractor } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { EXPOSURE_LABEL, NAV_LABEL, RECOMMENDATION_LABEL, TASK_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { SEVERITY_STYLE } from "./severity";

/**
 * Compact progression strip for the assessment page: conditions → receiver
 * evidence → task → recommendation → reasoning, with live values.
 */
export function AssessmentSteps({ className }: { className?: string }) {
  const { input, assessment } = useAssessment();
  const s = SEVERITY_STYLE[assessment.severity];
  const feedMissing = input.freshness === "missing";

  const steps = [
    {
      icon: SunMedium,
      label: "Conditions",
      value: `${EXPOSURE_LABEL[input.exposure]} exposure`,
      tone: "text-highlight",
    },
    {
      icon: SatelliteDish,
      label: "Receiver evidence",
      value: feedMissing ? "No data" : NAV_LABEL[input.navHealth],
      tone: feedMissing ? "text-status-gap" : "text-signal",
    },
    {
      icon: Tractor,
      label: "Task",
      value: TASK_LABEL[input.task],
      tone: "text-foreground",
    },
    {
      icon: ShieldCheck,
      label: "Recommendation",
      value: RECOMMENDATION_LABEL[assessment.recommendation],
      tone: s.text,
    },
    {
      icon: Eye,
      label: "Reasoning",
      value: `${assessment.rules.length} rule${assessment.rules.length === 1 ? "" : "s"} applied`,
      tone: "text-muted-foreground",
    },
  ];

  return (
    <ol
      aria-label="Assessment progression"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-3 rounded-xl border border-border bg-background/40 px-4 py-3 md:flex-nowrap",
        className,
      )}
    >
      {steps.map(({ icon: Icon, label, value, tone }, i) => (
        <li key={label} className="flex items-center gap-3">
          {i > 0 && <span className="flow-dash hidden h-px w-8 md:block" aria-hidden />}
          <span className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border-strong bg-background/70">
              <Icon className={cn("size-4", tone)} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.7rem] text-muted-foreground">
                <span className="font-mono text-muted-foreground/70">{i + 1}</span> · {label}
              </span>
              <span className={cn("block truncate text-sm font-medium leading-snug", tone === "text-muted-foreground" ? "text-foreground" : tone)}>
                {value}
              </span>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
