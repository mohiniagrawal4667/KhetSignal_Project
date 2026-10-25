import { KeyChip } from "./PresenterLayer";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Play, RotateCcw } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_TASK_POLICY,
  EXPOSURE_LABEL,
  EXPOSURE_OPTIONS,
  FIX_LABEL,
  FIX_OPTIONS,
  FRESHNESS_LABEL,
  FRESHNESS_OPTIONS,
  NAV_LABEL,
  NAV_OPTIONS,
  SCENARIO_PRESETS,
  TASK_LABEL,
  TASK_OPTIONS,
} from "@/lib/engine";
import { useAssessment } from "@/state/assessment-store";
import { cn } from "@/lib/utils";
import { Eyebrow, Panel } from "./primitives";

function Segmented<T extends string>({
  label,
  hint,
  desc,
  value,
  options,
  labels,
  onChange,
  columns,
}: {
  label: string;
  hint?: string;
  desc?: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
  columns?: number;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p id={id} className="text-sm font-medium">
          {label}
        </p>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {desc && <p className="mt-0.5 text-[0.8rem] leading-snug text-muted-foreground">{desc}</p>}
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as T)}
        aria-labelledby={id}
        className="mt-2 grid gap-1 rounded-lg border border-border bg-background/50 p-1"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <ToggleGroup.Item
            key={o}
            value={o}
            className={cn(
              "rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "data-[state=on]:bg-secondary data-[state=on]:text-foreground data-[state=on]:shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
            )}
          >
            {labels[o]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}

export function PresetPicker() {
  const { presetId, applyPreset } = useAssessment();
  return (
    <div className="grid gap-2">
      {SCENARIO_PRESETS.map((p, i) => {
        const active = p.id === presetId;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={active}
            onClick={() => applyPreset(p.id)}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              active
                ? "border-border-strong bg-secondary glow-signal"
                : "border-border bg-background/40 hover:border-border-strong hover:bg-secondary/50",
            )}
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md border font-mono text-xs",
                active ? "border-signal/60 text-signal" : "border-border text-muted-foreground",
              )}
            >
              {p.id}
            </span>
            <span>
              <span className="block text-[0.95rem] font-medium leading-snug">{p.title} <KeyChip k={String(i + 1)} /></span>
              <span className="mt-0.5 block text-[0.82rem] leading-snug text-muted-foreground">{p.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function LabControls() {
  const { input, setField, runAssessment, resetInputs, lastRunAt } = useAssessment();
  const threshold = DEFAULT_TASK_POLICY[input.task].minSignalQuality;
  const feedMissing = input.freshness === "missing";
  const sqReported = input.signalQuality !== null;

  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between">
        <Eyebrow>Inputs</Eyebrow>
        <span className="text-xs text-muted-foreground">Results recalculate instantly</span>
      </div>

      <div className="mt-5 space-y-5">
        <Segmented
          label="Space-weather exposure"
          hint="context"
          desc="Conditions in the environment that can affect satellite signals."
          value={input.exposure}
          options={EXPOSURE_OPTIONS}
          labels={EXPOSURE_LABEL}
          onChange={(v) => setField("exposure", v)}
        />
        <Segmented
          label="Data freshness"
          hint="quality"
          desc="How recently the receiver evidence was collected."
          value={input.freshness}
          options={FRESHNESS_OPTIONS}
          labels={FRESHNESS_LABEL}
          onChange={(v) => setField("freshness", v)}
        />

        <div className={cn("space-y-5 rounded-xl border border-border p-4 transition-opacity", feedMissing && "border-dashed opacity-60")}>
          <div className="flex items-center justify-between">
            <p className="eyebrow text-[0.62rem] text-signal">Receiver evidence</p>
            {feedMissing && <span className="text-xs text-status-elevated">Ignored while feed is missing</span>}
          </div>
          <Segmented
            label="Navigation health"
            desc="What the receiver reports about positioning quality."
            value={input.navHealth}
            options={NAV_OPTIONS}
            labels={NAV_LABEL}
            onChange={(v) => setField("navHealth", v)}
          />
          <Segmented
            label="Fix status"
            hint="optional"
            desc="How stable the position fix is right now."
            value={input.fixStatus}
            options={FIX_OPTIONS}
            labels={FIX_LABEL}
            onChange={(v) => setField("fixStatus", v)}
          />
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="sq-slider" className="text-sm font-medium">
                Signal quality <span className="text-xs font-normal text-muted-foreground">optional</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Reported</span>
                <Switch
                  checked={sqReported}
                  onCheckedChange={(c) => setField("signalQuality", c ? 70 : null)}
                  aria-label="Signal quality reported"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <Slider
                id="sq-slider"
                min={0}
                max={100}
                step={1}
                disabled={!sqReported}
                value={[input.signalQuality ?? 0]}
                onValueChange={([v]) => setField("signalQuality", v ?? 0)}
                aria-label="Signal quality"
                className="flex-1"
              />
              <span
                className={cn(
                  "w-12 text-right font-mono text-lg tabular-nums",
                  !sqReported ? "text-muted-foreground" : (input.signalQuality ?? 0) < threshold ? "text-status-elevated" : "text-signal",
                )}
              >
                {sqReported ? input.signalQuality : "—"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Threshold for {TASK_LABEL[input.task].toLowerCase()}: <span className="text-highlight">{threshold}</span> (configurable task policy)
            </p>
          </div>
        </div>

        <Segmented
          label="Agricultural task"
          hint="policy"
          desc="How much the operation depends on accurate positioning."
          value={input.task}
          options={TASK_OPTIONS}
          labels={TASK_LABEL}
          onChange={(v) => setField("task", v)}
          columns={2}
        />

        <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
          <div>
            <label htmlFor="obstruction" className="text-sm font-medium">
              Obstruction / interference flag
            </label>
            <p className="text-xs text-muted-foreground">Operator-reported: tree line, structure, local RF source</p>
          </div>
          <Switch id="obstruction" checked={input.obstruction} onCheckedChange={(c) => setField("obstruction", c)} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button onClick={runAssessment} className="glow-signal">
          <Play aria-hidden /> Run assessment
        </Button>
        <Button variant="outline" onClick={resetInputs} className="bg-transparent">
          <RotateCcw aria-hidden /> Reset
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {lastRunAt ? `Last run ${lastRunAt}` : "Run saves a checkpoint for comparison"}
        </span>
      </div>
    </Panel>
  );
}
