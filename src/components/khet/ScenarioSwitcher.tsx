import { SCENARIO_PRESETS } from "@/lib/engine";
import { useAssessment } from "@/state/assessment-store";
import { cn } from "@/lib/utils";
import { KeyChip } from "./PresenterLayer";

/** Compact one-click scenario switcher for live demos. */
export function ScenarioSwitcher({ className }: { className?: string }) {
  const { presetId, applyPreset } = useAssessment();
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <p className="eyebrow text-[0.62rem]">Scenario {presetId ? "" : "· custom inputs"}</p>
      <div role="group" aria-label="Scenario presets" className="flex max-w-full gap-1.5 overflow-x-auto rounded-xl sm:flex-wrap border border-border bg-background/50 p-1.5 backdrop-blur">
        {SCENARIO_PRESETS.map((p, i) => {
          const active = p.id === presetId;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              title={p.title}
              onClick={() => applyPreset(p.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                active
                  ? "bg-secondary text-foreground glow-signal"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span className={cn("font-mono text-xs", active ? "text-signal" : "text-muted-foreground")}>{p.id}</span>
              <span className="whitespace-nowrap">{p.short}</span>
              <KeyChip k={String(i + 1)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
