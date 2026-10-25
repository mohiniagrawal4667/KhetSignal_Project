import { ArrowRight, Eye, ShieldOff } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { cn } from "@/lib/utils";
import { BulletList, Eyebrow, Panel } from "./primitives";
import { SEVERITY_STYLE } from "./severity";

export function RationalePanel() {
  const { assessment } = useAssessment();
  const s = SEVERITY_STYLE[assessment.severity];
  return (
    <Panel className="grid gap-px overflow-hidden p-0 md:grid-cols-3">
      <div className="p-7">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-signal" aria-hidden />
          <Eyebrow className="text-foreground">What we observed</Eyebrow>
        </div>
        <div className="mt-4">
          <BulletList items={assessment.observed} />
        </div>
      </div>
      <div className="border-t border-border p-7 md:border-l md:border-t-0">
        <div className="flex items-center gap-2">
          <ShieldOff className="size-4 text-highlight" aria-hidden />
          <Eyebrow className="text-foreground">What this does not prove</Eyebrow>
        </div>
        <div className="mt-4">
          <BulletList items={assessment.notProven} tone="highlight" />
        </div>
      </div>
      <div className={cn("border-t border-border p-7 md:border-l md:border-t-0", s.soft)}>
        <div className="flex items-center gap-2">
          <ArrowRight className={cn("size-4", s.text)} aria-hidden />
          <Eyebrow className="text-foreground">Recommended next step</Eyebrow>
        </div>
        <p className="mt-4 text-[1.02rem] leading-relaxed">{assessment.nextStep}</p>
        <p className="mt-4 text-sm text-muted-foreground">Conditional guidance. Your approved procedures take precedence.</p>
      </div>
    </Panel>
  );
}
