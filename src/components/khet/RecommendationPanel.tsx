import { ShieldAlert } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { EVIDENCE_STATUS_LABEL, RULES, TASK_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel, RecommendationText, SeverityBadge, UpdatedFlash } from "./primitives";
import { SEVERITY_STYLE } from "./severity";

export function RecommendationPanel({ className }: { className?: string }) {
  const { assessment, input, scenarioLabel, updateTick } = useAssessment();
  const s = SEVERITY_STYLE[assessment.severity];

  return (
    <Panel strong className={cn("overflow-hidden p-7 md:p-8", className)} aria-live="polite">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-px", s.dot)} aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>Current recommendation</Eyebrow>
        <div className="flex items-center gap-2">
          <UpdatedFlash tick={updateTick} />
          <SeverityBadge severity={assessment.severity} />
        </div>
      </div>

      <h2 key={assessment.recommendation} className="mt-5 animate-fade-up">
        <RecommendationText
          recommendation={assessment.recommendation}
          severity={assessment.severity}
          className="text-4xl leading-tight md:text-[2.75rem]"
        />
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/90">{assessment.summary}</p>

      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {[
          ["Scenario", scenarioLabel],
          ["Task", TASK_LABEL[input.task]],
          ["Evidence", EVIDENCE_STATUS_LABEL[assessment.evidenceStatus]],
          ["Rules applied", assessment.rules.join(" · ")],
        ].map(([k, v]) => (
          <div key={k} className="bg-background-elevated/80 px-4 py-3">
            <dt className="eyebrow text-[0.64rem]">{k}</dt>
            <dd className="mt-1 truncate text-[0.95rem] font-medium" title={k === "Rules applied" ? assessment.rules.map((r) => RULES[r].label).join(", ") : v}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-highlight" aria-hidden />
        {assessment.disclaimer}
      </p>
    </Panel>
  );
}
