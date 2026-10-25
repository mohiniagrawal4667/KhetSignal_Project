import { ArrowRight, GitCompareArrows } from "lucide-react";
import { useMemo } from "react";

import { useAssessment } from "@/state/assessment-store";
import { explainChange, RECOMMENDATION_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel } from "./primitives";
import { SEVERITY_STYLE } from "./severity";

export function ChangePanel() {
  const { baseline, baselineAssessment, input, assessment } = useAssessment();
  const result = useMemo(
    () => explainChange(baseline.input, baselineAssessment, input, assessment),
    [baseline, baselineAssessment, input, assessment],
  );
  const before = SEVERITY_STYLE[baselineAssessment.severity];
  const after = SEVERITY_STYLE[assessment.severity];

  return (
    <Panel className="p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="size-4 text-signal" aria-hidden />
          <Eyebrow className="text-foreground">Why did the recommendation change?</Eyebrow>
        </div>
        <span className="text-xs text-muted-foreground">Compared with: {baseline.label}</span>
      </div>

      {result.changes.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          No input changes since {baseline.label.toLowerCase()}. Pick another preset or adjust an input to see what moves the
          recommendation.
        </p>
      ) : (
        <>
          <div className="mt-5 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
            <div className={cn("rounded-lg border px-4 py-3", before.border, "bg-background/40")}>
              <p className="eyebrow text-[0.6rem]">Before</p>
              <p className={cn("mt-1 font-semibold uppercase tracking-wide", before.text)}>
                {RECOMMENDATION_LABEL[baselineAssessment.recommendation]}
              </p>
            </div>
            <ArrowRight className="mx-auto size-5 text-muted-foreground" aria-hidden />
            <div className={cn("rounded-lg border px-4 py-3", after.border, after.soft)}>
              <p className="eyebrow text-[0.6rem]">After</p>
              <p className={cn("mt-1 font-semibold uppercase tracking-wide", after.text)}>
                {RECOMMENDATION_LABEL[assessment.recommendation]}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="eyebrow text-[0.62rem]">Inputs changed</p>
              <ul className="mt-2 space-y-1.5">
                {result.changes.map((c) => (
                  <li key={c.field} className="flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="text-muted-foreground">{c.label}:</span>
                    <span className="line-through decoration-muted-foreground/60">{c.from}</span>
                    <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
                    <span className="font-medium text-signal">{c.to}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-[0.62rem]">Rule changes</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {result.explanation.map((e) => (
                  <li key={e} className="leading-snug">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
