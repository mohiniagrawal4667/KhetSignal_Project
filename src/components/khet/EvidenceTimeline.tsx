import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAssessment } from "@/state/assessment-store";
import { buildTimeline, EXPOSURE_LABEL, FIX_LABEL, type TimelinePoint } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel, SimulatedTag } from "./primitives";

const EXPOSURE_CELL: Record<TimelinePoint["exposure"], string> = {
  quiet: "bg-muted",
  elevated: "bg-highlight/45",
  high: "bg-highlight",
};

const FIX_CELL: Record<TimelinePoint["fix"], string> = {
  stable: "bg-status-routine/70",
  unstable: "bg-status-elevated",
  nofix: "bg-status-high",
  unreported: "bg-transparent",
  none: "bg-transparent border border-dashed border-border",
};

function Strip({ label, cells }: { label: string; cells: { key: number; className: string; title: string }[] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 eyebrow text-[0.6rem]">{label}</span>
      <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
        {cells.map((c) => (
          <span key={c.key} title={c.title} className={cn("h-3 rounded-[2px]", c.className)} />
        ))}
      </div>
    </div>
  );
}

export function EvidenceTimeline({ className, height = 200 }: { className?: string; height?: number }) {
  const { input } = useAssessment();
  const tl = useMemo(() => buildTimeline(input), [input]);
  const hasSignal = tl.points.some((p) => p.signal !== null);
  const firstGap = tl.feedEndsAt !== null ? tl.points.find((p) => p.minute > tl.feedEndsAt!)?.label : undefined;

  return (
    <Panel className={cn("p-7", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>Evidence timeline · last 2 h</Eyebrow>
          <p className="mt-1 text-sm text-muted-foreground">
            Illustrative series generated from the scenario inputs. Not used by the decision engine.
          </p>
        </div>
        <SimulatedTag>Sample · simulated</SimulatedTag>
      </div>

      <div className="mt-5 space-y-2 pr-2">
        <Strip
          label="Exposure"
          cells={tl.points.map((p) => ({ key: p.minute, className: EXPOSURE_CELL[p.exposure], title: `${p.label}: ${EXPOSURE_LABEL[p.exposure]}` }))}
        />
        <Strip
          label="Fix status"
          cells={tl.points.map((p) => ({
            key: p.minute,
            className: FIX_CELL[p.fix],
            title: `${p.label}: ${p.fix === "none" ? "No record" : FIX_LABEL[p.fix]}`,
          }))}
        />
      </div>

      <div className="relative mt-4" style={{ height }}>
        {!hasSignal && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-lg border border-dashed border-border bg-background/50">
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              {input.freshness === "missing"
                ? "No receiver records in this window. Nothing is plotted rather than estimated."
                : "Signal quality not reported by the receiver."}
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tl.points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              interval={5}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            {firstGap && (
              <ReferenceArea
                x1={firstGap}
                x2="now"
                fill="var(--color-status-gap)"
                fillOpacity={0.08}
                label={{ value: "no records", fill: "var(--color-muted-foreground)", fontSize: 11, position: "insideTop" }}
              />
            )}
            <ReferenceLine
              y={tl.threshold}
              stroke="var(--color-highlight)"
              strokeDasharray="5 5"
              label={{ value: `task threshold ${tl.threshold}`, fill: "var(--color-highlight)", fontSize: 11, position: "insideTopRight" }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 8,
                color: "var(--color-foreground)",
                fontSize: 12,
              }}
              formatter={(v) => [v ?? "—", "Signal quality"]}
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="var(--color-signal)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-signal" /> Signal quality (0–100)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-status-routine/70" /> Stable</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-status-elevated" /> Unstable</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] bg-status-high" /> No fix</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[2px] border border-dashed border-border" /> No record</span>
      </div>
    </Panel>
  );
}
