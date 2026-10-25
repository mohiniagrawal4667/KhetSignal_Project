import { useMemo } from "react";

import { useAssessment } from "@/state/assessment-store";
import { estimateDrift, TASK_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { DomainTooltip } from "./DomainTooltip";
import { Eyebrow, Panel, SimulatedTag } from "./primitives";

const W = 960;
const H = 200;
const MID = H / 2;
/** px per cm, capped so large errors still fit. */
const toPx = (cm: number) => Math.min(cm, 70) * 1.2;

function pathFor(errCm: number, seed: number) {
  const amp = toPx(errCm);
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = 20 + (i / 60) * (W - 90);
    const t = i / 6 + seed;
    const y = MID + amp * (0.6 * Math.sin(t) + 0.3 * Math.sin(t * 2.7 + 1) + 0.1 * Math.sin(t * 7.3));
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function FieldDriftVisualizer({ className }: { className?: string }) {
  const { input } = useAssessment();
  const d = estimateDrift(input);
  const lost = d.mode === "lost";
  const color = lost
    ? "var(--color-status-gap)"
    : d.exceeds
      ? "var(--color-highlight)"
      : "var(--color-status-routine)";
  const path = useMemo(() => pathFor(lost ? 4 : (d.errorCm ?? 0), input.task.length), [lost, d.errorCm, input.task]);
  const band = toPx(d.toleranceCm);
  const endY = MID + (lost ? 0 : toPx(d.errorCm ?? 0) * 0.4);

  return (
    <Panel className={cn("p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>Guidance pass · <DomainTooltip term="xte">cross-track error</DomainTooltip></Eyebrow>
        <SimulatedTag>Illustrative</SimulatedTag>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background/40">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={lost ? "Telemetry lost, fallback swath" : `Illustrative swath error ${d.errorCm} centimetres against ${d.toleranceCm} centimetre tolerance`}>
          {/* crop rows */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={0} x2={W} y1={12 + i * 22} y2={12 + i * 22} stroke="var(--color-border)" strokeWidth={1} opacity={0.5} />
          ))}
          {/* tolerance band */}
          <rect x={0} y={MID - band} width={W} height={band * 2} fill={color} opacity={0.1} />
          <line x1={0} x2={W} y1={MID - band} y2={MID - band} stroke={color} strokeDasharray="4 4" opacity={0.7} />
          <line x1={0} x2={W} y1={MID + band} y2={MID + band} stroke={color} strokeDasharray="4 4" opacity={0.7} />
          {/* centerline */}
          <line x1={0} x2={W} y1={MID} y2={MID} stroke="var(--color-signal)" strokeWidth={1.2} opacity={0.8} />
          {/* track */}
          <path
            key={path}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray={lost ? "3 7" : undefined}
            opacity={lost ? 0.5 : 1}
            className="animate-fade-up"
          />
          {/* vehicle + implement */}
          <g transform={`translate(${W - 70}, ${endY})`} opacity={lost ? 0.45 : 1}>
            <rect x={-6} y={-Math.max(band, 14)} width={4} height={Math.max(band, 14) * 2} fill="var(--color-muted-foreground)" rx={1} />
            <rect x={0} y={-9} width={28} height={18} rx={4} fill="var(--color-background)" stroke={color} strokeWidth={2} />
            <line x1={28} y1={0} x2={50} y2={0} stroke={color} strokeWidth={2} />
            <path d="M50,-5 L58,0 L50,5 Z" fill={color} />
          </g>
          <text x={8} y={MID - band - 6} fill={color} fontSize={11} fontFamily="var(--font-mono, monospace)">±{d.toleranceCm} cm limit</text>
        </svg>
      </div>
      <p className="mt-4 text-[0.95rem]" aria-live="polite">
        {lost ? (
          <span className="font-medium text-status-gap">Telemetry lost · fallback swath — position not estimated</span>
        ) : (
          <>
            <span className={cn("font-mono font-semibold", d.exceeds ? "text-highlight" : "text-status-routine")}>
              ±{d.errorCm} cm swath error
            </span>
            <span className="text-muted-foreground">
              {" "}— {d.exceeds ? "exceeds" : "within"} the {d.toleranceCm} cm limit for {TASK_LABEL[input.task].toLowerCase()}
            </span>
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Visual aid derived from scenario inputs; not a measurement and not used in the decision.</p>
    </Panel>
  );
}
