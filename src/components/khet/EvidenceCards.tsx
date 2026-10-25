import { Orbit, SatelliteDish, Tractor } from "lucide-react";
import type { ReactNode } from "react";

import { useAssessment } from "@/state/assessment-store";
import {
  DEFAULT_TASK_POLICY,
  EVIDENCE_STATUS_LABEL,
  EXPOSURE_LABEL,
  FIX_LABEL,
  FRESHNESS_DETAIL,
  FRESHNESS_LABEL,
  NAV_LABEL,
  type Exposure,
} from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel } from "./primitives";
import { DomainTooltip } from "./DomainTooltip";

function Meta({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="eyebrow text-[0.6rem]">{k}</dt>
          <dd className="mt-1 text-[0.82rem] leading-snug text-foreground/85">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({
  icon,
  role,
  title,
  value,
  valueClass,
  children,
  meta,
}: {
  icon: ReactNode;
  role: string;
  title: string;
  value: string;
  valueClass?: string;
  children?: ReactNode;
  meta: [string, string][];
}) {
  return (
    <Panel className="flex flex-col p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-border-strong bg-background/60 text-signal">
            {icon}
          </span>
          <h3 className="text-[1.02rem] font-medium">{title}</h3>
        </div>
        <Eyebrow className="text-[0.62rem]">{role}</Eyebrow>
      </div>
      <p key={value} className={cn("mt-5 font-display text-[2.6rem] leading-none animate-fade-up", valueClass)}>
        {value}
      </p>
      <div className="mt-3 flex-1">{children}</div>
      <Meta items={meta} />
    </Panel>
  );
}

const EXPOSURE_LEVEL: Record<Exposure, number> = { quiet: 1, elevated: 2, high: 3 };

export function EvidenceCards() {
  const { input, assessment } = useAssessment();
  const policy = DEFAULT_TASK_POLICY[input.task];
  const feedMissing = input.freshness === "missing";
  const level = EXPOSURE_LEVEL[input.exposure];

  const navValue = feedMissing ? "No data" : NAV_LABEL[input.navHealth];
  const navClass = feedMissing
    ? "text-status-gap"
    : input.navHealth === "healthy"
      ? "text-status-routine"
      : input.navHealth === "degraded"
        ? "text-status-elevated"
        : "text-status-gap";

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card
        icon={<Orbit className="size-5" aria-hidden />}
        role="Context"
        title="Space-weather exposure"
        value={EXPOSURE_LABEL[input.exposure]}
        valueClass={input.exposure === "high" ? "text-highlight" : input.exposure === "elevated" ? "text-highlight/80" : "text-foreground"}
        meta={[
          ["Source", "Illustrative regional index"],
          ["Quality", "Sample data"],
          ["Freshness", "Scenario-defined"],
        ]}
      >
        <div className="flex gap-1.5" aria-label={`Exposure level ${level} of 3`}>
          {[1, 2, 3].map((i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= level ? "bg-highlight" : "bg-muted")} />
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Environmental context (e.g. <DomainTooltip term="kp" />, <DomainTooltip term="xray">X-ray flux</DomainTooltip>, <DomainTooltip term="s4">scintillation</DomainTooltip>). Not proof of receiver impact.</p>
      </Card>

      <Card
        icon={<SatelliteDish className="size-5" aria-hidden />}
        role="Evidence"
        title="GNSS navigation health"
        value={navValue}
        valueClass={navClass}
        meta={[
          ["Source", "Simulated receiver feed"],
          ["Quality", EVIDENCE_STATUS_LABEL[assessment.evidenceStatus]],
          ["Freshness", `${FRESHNESS_LABEL[input.freshness]} · ${FRESHNESS_DETAIL[input.freshness].replace("Records within the last ", "<").replace("Last record older than ", ">")}`],
        ]}
      >
        {feedMissing ? (
          <p className="text-sm text-muted-foreground">No receiver records in the assessment window. Values are not estimated.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
              <p className="eyebrow text-[0.6rem]"><DomainTooltip term="rtk">Fix</DomainTooltip></p>
              <p className="mt-0.5 font-medium">{FIX_LABEL[input.fixStatus]}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
              <p className="eyebrow text-[0.6rem]">Signal quality</p>
              <p className="mt-0.5 font-medium">
                {input.signalQuality ?? "—"}
                <span className="text-muted-foreground"> / 100 · min {policy.minSignalQuality}</span>
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card
        icon={<Tractor className="size-5" aria-hidden />}
        role="Requirement"
        title="Field operation"
        value={policy.label}
        valueClass="text-[2rem]"
        meta={[
          ["Source", "Operator input"],
          ["Quality", "Declared"],
          ["Freshness", "This session"],
        ]}
      >
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-border-strong px-2.5 py-0.5 capitalize">
            {policy.dependence} dependence
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
            Signal min {policy.minSignalQuality}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5",
              input.obstruction ? "border-highlight/50 text-highlight" : "border-border text-muted-foreground",
            )}
          >
            {input.obstruction ? "Obstruction flagged" : "No obstruction"}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{policy.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">See <DomainTooltip term="envelope">drift tolerance</DomainTooltip>{input.task === "autonomous" && <> · <DomainTooltip term="interlock" /></>}</p>
      </Card>
    </div>
  );
}
