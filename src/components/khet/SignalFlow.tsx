import { Orbit, SatelliteDish, Tractor } from "lucide-react";
import type { ReactNode } from "react";

import { useAssessment } from "@/state/assessment-store";
import { EXPOSURE_LABEL, FIX_LABEL, NAV_LABEL, RECOMMENDATION_LABEL, TASK_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel } from "./primitives";
import { SEVERITY_STYLE } from "./severity";

/*
 * Space-to-field illustration: sun (space-weather context) → satellite signal path
 * through the ionosphere → farm receiver → field decision. Conceptual styling only —
 * colors derive from engine inputs here and never feed back into assess().
 */

const SEVERITY_VAR: Record<string, string> = {
  routine: "var(--color-status-routine)",
  watch: "var(--color-status-watch)",
  elevated: "var(--color-status-elevated)",
  high: "var(--color-status-high)",
  gap: "var(--color-status-gap)",
};

const EXPOSURE_HALO: Record<string, number> = { quiet: 15, elevated: 24, high: 33 };

function Node({
  icon,
  step,
  title,
  value,
  sub,
  tone,
}: {
  icon: ReactNode;
  step: string;
  title: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className={cn("relative grid size-12 shrink-0 place-items-center rounded-full border bg-background/70", tone)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-[0.62rem]">
          {step} · {title}
        </p>
        <p className="mt-1 text-lg font-medium leading-tight">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Link({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-4 py-2 pl-6">
      <span
        className={cn("h-10 w-px", dashed ? "bg-[repeating-linear-gradient(180deg,var(--color-border-strong)_0_4px,transparent_4px_8px)]" : "bg-signal/60")}
        aria-hidden
      />
      <span className={cn("font-mono text-[0.66rem] uppercase tracking-[0.16em]", dashed ? "text-muted-foreground" : "text-signal")}>
        {label}
      </span>
    </div>
  );
}

function MapLabel({
  x,
  y,
  anchor = "middle",
  children,
}: {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={9.5}
      letterSpacing={1.4}
      style={{ fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
    >
      {children}
    </text>
  );
}

export function SignalFlow({ className }: { className?: string }) {
  const { input, assessment } = useAssessment();
  const feedMissing = input.freshness === "missing";
  const s = SEVERITY_STYLE[assessment.severity];
  const sevVar = SEVERITY_VAR[assessment.severity] ?? SEVERITY_VAR["gap"];
  const halo = EXPOSURE_HALO[input.exposure] ?? 15;
  const signalStroke =
    feedMissing
      ? "var(--color-status-gap)"
      : input.navHealth === "degraded" || input.fixStatus === "unstable"
        ? "var(--color-highlight)"
        : "var(--color-signal)";

  return (
    <Panel className={cn("p-7", className)}>
      <div className="flex items-center justify-between">
        <Eyebrow>Evidence path</Eyebrow>
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">Space → Signal → Field</span>
      </div>

      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label="Illustration: a satellite signal passes through the ionosphere to a farm receiver, informing a field decision. Space weather is shown as context only."
        className="mt-4 w-full"
      >
        {/* Ionosphere band (violet) */}
        <path d="M 10 249.6 A 470 470 0 0 1 410 249.6 L 410 266.3 A 455 455 0 0 0 10 266.3 Z" style={{ fill: "var(--color-orbit)", opacity: 0.1 }} />
        <path d="M 10 249.6 A 470 470 0 0 1 410 249.6" fill="none" strokeDasharray="3 6" style={{ stroke: "var(--color-orbit)", opacity: 0.55 }} />
        <MapLabel x={14} y={243} anchor="start">
          Ionosphere
        </MapLabel>

        {/* Earth & agricultural field (green) */}
        <path d="M 10 300 A 425 425 0 0 1 410 300 Z" style={{ fill: "var(--color-field)", opacity: 0.16 }} />
        <path d="M 10 300 A 425 425 0 0 1 410 300" fill="none" strokeWidth={1.2} style={{ stroke: "var(--color-field)", opacity: 0.7 }} />
        <path d="M 70 284.3 A 415 415 0 0 1 350 284.3" fill="none" style={{ stroke: "var(--color-field)", opacity: 0.4 }} />
        <path d="M 90 293.4 A 400 400 0 0 1 330 293.4" fill="none" style={{ stroke: "var(--color-field)", opacity: 0.3 }} />

        {/* Sun — space-weather context; halo scales with exposure level */}
        <circle cx={70} cy={58} r={halo} className="animate-pulse-soft" style={{ fill: "var(--color-highlight)", opacity: 0.18 }} />
        <circle cx={70} cy={58} r={9} style={{ fill: "var(--color-highlight)" }} />
        <path
          d="M70 42 v-6 M70 74 v6 M54 58 h-6 M86 58 h6 M59 47 l-4 -4 M81 47 l4 -4 M59 69 l-4 4 M81 69 l4 4"
          style={{ stroke: "var(--color-highlight)", opacity: 0.55 }}
          fill="none"
        />
        <MapLabel x={70} y={92}>Space weather</MapLabel>
        {/* context ray: dashed and clearly separated from the evidence path */}
        <path d="M 92 74 Q 170 140 256 204" fill="none" strokeDasharray="2 7" style={{ stroke: "var(--color-highlight)", opacity: 0.4 }} />

        {/* Satellite */}
        <g className="float-soft">
          <rect x={300} y={54} width={22} height={9} rx={1.5} style={{ fill: "var(--color-orbit)", opacity: 0.3, stroke: "var(--color-orbit)" }} />
          <rect x={354} y={54} width={22} height={9} rx={1.5} style={{ fill: "var(--color-orbit)", opacity: 0.3, stroke: "var(--color-orbit)" }} />
          <rect x={324} y={50} width={28} height={17} rx={3} style={{ fill: "var(--color-signal)", opacity: 0.18, stroke: "var(--color-signal)" }} />
          <path d="M 338 67 L 338 76 M 333 76 A 5 5 0 0 0 343 76" fill="none" style={{ stroke: "var(--color-signal)" }} />
        </g>
        <MapLabel x={338} y={40}>Satellite</MapLabel>

        {/* Observed signal path: satellite → receiver */}
        <path
          d="M 330 80 Q 300 160 250 240"
          fill="none"
          className={feedMissing ? undefined : "signal-flow"}
          strokeDasharray={feedMissing ? "2 6" : undefined}
          style={{ stroke: signalStroke, opacity: feedMissing ? 0.3 : 0.9, strokeWidth: 1.6 }}
        />
        {feedMissing && (
          <MapLabel x={300} y={152}>
            No receiver data
          </MapLabel>
        )}

        {/* Farm receiver on the field surface */}
        <line x1={245} y1={251} x2={245} y2={239} style={{ stroke: "var(--color-signal)" }} />
        <circle cx={245} cy={236} r={3} style={{ fill: "var(--color-signal)" }} />
        <MapLabel x={245} y={271}>Field receiver</MapLabel>

        {/* Decision path: distinct, flows to the decision node */}
        <path d="M 252 258 Q 300 266 338 266" fill="none" className="decision-flow" style={{ stroke: sevVar, strokeWidth: 1.6 }} />
        <circle cx={348} cy={266} r={10} className="pulse-ring" style={{ fill: sevVar }} />
        <circle cx={348} cy={266} r={5} style={{ fill: sevVar }} />
        <MapLabel x={348} y={252}>Decision</MapLabel>
      </svg>

      <div className="mt-5">
        <Node
          icon={<Orbit className="size-5 text-highlight" aria-hidden />}
          step="01"
          title="Space"
          value={`${EXPOSURE_LABEL[input.exposure]} exposure`}
          sub="Environmental context"
          tone="border-highlight/50"
        />
        <Link label="context — not a cause" dashed />
        <Node
          icon={<SatelliteDish className="size-5 text-signal" aria-hidden />}
          step="02"
          title="Signal"
          value={feedMissing ? "No receiver data" : `${NAV_LABEL[input.navHealth]} navigation`}
          sub={
            feedMissing
              ? "Evidence unavailable"
              : `Fix ${FIX_LABEL[input.fixStatus].toLowerCase()} · signal ${input.signalQuality ?? "n/r"}`
          }
          tone="border-signal/50"
        />
        <Link label="observed evidence" />
        <Node
          icon={<Tractor className={cn("size-5", s.text)} aria-hidden />}
          step="03"
          title="Field decision"
          value={RECOMMENDATION_LABEL[assessment.recommendation]}
          sub={`for ${TASK_LABEL[input.task].toLowerCase()}`}
          tone={cn(s.border, "ring-4", s.ring)}
        />
      </div>
    </Panel>
  );
}
