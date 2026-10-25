import { ArrowRight, ListChecks, ShieldOff } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { EVIDENCE_STATUS_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { BulletList, Eyebrow, Panel, RecommendationText, SeverityBadge, UpdatedFlash } from "./primitives";
import { EFFECT_STYLE, SEVERITY_STYLE } from "./severity";

export function ResultCard() {
  const { assessment, updateTick } = useAssessment();
  const s = SEVERITY_STYLE[assessment.severity];

  return (
    <Panel strong className="overflow-hidden p-7" aria-live="polite">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-px", s.dot)} aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>Assessment result</Eyebrow>
        <div className="flex items-center gap-2">
          <UpdatedFlash tick={updateTick} />
          <SeverityBadge severity={assessment.severity} />
        </div>
      </div>
      <h2 key={assessment.recommendation} className="mt-4 animate-fade-up">
        <RecommendationText recommendation={assessment.recommendation} severity={assessment.severity} className="text-[2.1rem] leading-tight" />
      </h2>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-foreground/90">{assessment.summary}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-signal" aria-hidden />
            <Eyebrow className="text-foreground">Why</Eyebrow>
          </div>
          <div className="mt-3">
            <BulletList items={assessment.reasons} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Eyebrow className="text-foreground">Evidence summary · {EVIDENCE_STATUS_LABEL[assessment.evidenceStatus]}</Eyebrow>
            <ul className="mt-3 grid grid-cols-1 gap-1.5">
              {assessment.factors.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/40 px-3 py-1.5 text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", EFFECT_STYLE[f.effect].className)}>{f.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
        <div className="bg-background-elevated/90 p-5">
          <div className="flex items-center gap-2">
            <ShieldOff className="size-4 text-highlight" aria-hidden />
            <Eyebrow className="text-foreground">What this does not prove</Eyebrow>
          </div>
          <div className="mt-3">
            <BulletList items={assessment.notProven} tone="highlight" />
          </div>
        </div>
        <div className={cn("bg-background-elevated/90 p-5")}>
          <div className="flex items-center gap-2">
            <ArrowRight className={cn("size-4", s.text)} aria-hidden />
            <Eyebrow className="text-foreground">Suggested next step</Eyebrow>
          </div>
          <p className="mt-3 text-[0.95rem] leading-relaxed">{assessment.nextStep}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{assessment.disclaimer}</p>
    </Panel>
  );
}
