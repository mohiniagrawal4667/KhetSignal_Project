import { DomainTooltip, type GlossaryKey } from "./DomainTooltip";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, MapPinned, Scale } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { FRESHNESS_DETAIL, FRESHNESS_LABEL, RULES } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel } from "./primitives";
import { EFFECT_STYLE } from "./severity";

const ROLE_LABEL = { context: "Context", evidence: "Evidence", quality: "Data quality", policy: "Task policy" } as const;

const FACTOR_TERM: Partial<Record<string, GlossaryKey>> = { exposure: "kp", fixStatus: "rtk", signalQuality: "cycleslip", task: "envelope" };

export function FactorTable() {
  const { assessment } = useAssessment();
  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-7 pb-3 pt-6">
        <Eyebrow>Factors used</Eyebrow>
        <span className="text-xs text-muted-foreground">No weights, no score — each factor maps to explicit rules</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[0.92rem]">
          <thead>
            <tr className="border-y border-border bg-background/40">
              {["Factor", "Value", "Channel", "Effect", "Note"].map((h) => (
                <th key={h} scope="col" className="px-7 py-2.5 eyebrow text-[0.6rem] font-normal first:pl-7">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assessment.factors.map((f) => {
              const e = EFFECT_STYLE[f.effect];
              return (
                <tr key={f.id} className="border-b border-border/60 last:border-0">
                  <td className="px-7 py-3 font-medium">{FACTOR_TERM[f.id] ? <DomainTooltip term={FACTOR_TERM[f.id]!}>{f.label}</DomainTooltip> : f.label}</td>
                  <td className="px-7 py-3">{f.value}</td>
                  <td className="px-7 py-3 text-muted-foreground">{ROLE_LABEL[f.role]}</td>
                  <td className="px-7 py-3">
                    <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs", e.className)}>{e.label}</span>
                  </td>
                  <td className="px-7 py-3 text-sm text-muted-foreground">{f.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function RulesApplied() {
  const { assessment } = useAssessment();
  return (
    <Panel className="p-7">
      <Eyebrow>Rules applied</Eyebrow>
      <ol className="mt-4 space-y-3">
        {assessment.rules.map((r) => (
          <li key={r} className="flex gap-3 animate-fade-up">
            <span className="mt-0.5 grid h-6 min-w-9 place-items-center rounded-md border border-border-strong bg-background/60 font-mono text-xs text-signal">
              {r}
            </span>
            <div>
              <p className="font-medium">{RULES[r].label}</p>
              <p className="text-sm text-muted-foreground">{RULES[r].description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function DataQualityPanel() {
  const { assessment, input } = useAssessment();
  const checks = [
    {
      icon: Clock,
      label: "Timestamps & freshness",
      ok: input.freshness === "current",
      detail: `${FRESHNESS_LABEL[input.freshness]} — ${FRESHNESS_DETAIL[input.freshness]}`,
    },
    {
      icon: CircleDashed,
      label: "Missing fields",
      ok: assessment.missingFields.length === 0,
      detail: assessment.missingFields.length ? assessment.missingFields.join(", ") : "All evidence fields present",
    },
    {
      icon: MapPinned,
      label: "Geographic / time alignment",
      ok: false,
      detail: "Exposure is regional context only; not aligned to receiver position (prototype limitation)",
    },
    {
      icon: Scale,
      label: "Indicator agreement",
      ok: assessment.conflicts.length === 0,
      detail: assessment.conflicts.length ? assessment.conflicts.join(" ") : "Receiver indicators agree",
    },
  ];
  return (
    <Panel className="p-7">
      <Eyebrow>Data quality checks</Eyebrow>
      <ul className="mt-4 space-y-3.5">
        {checks.map(({ icon: Icon, label, ok, detail }) => (
          <li key={label} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{label}</p>
                {ok ? (
                  <CheckCircle2 className="size-4 text-status-routine" aria-label="passed" />
                ) : (
                  <AlertTriangle className="size-4 text-status-elevated" aria-label="attention" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
