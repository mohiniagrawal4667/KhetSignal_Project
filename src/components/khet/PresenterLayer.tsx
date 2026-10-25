import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { SCENARIO_PRESETS } from "@/lib/engine";
import { useAssessment } from "@/state/assessment-store";

const POINTS = [
  ["Space weather is context", "Exposure raises attention — it never proves a receiver fault."],
  ["Navigation health is evidence", "Fix status, signal quality and freshness decide what we know."],
  ["Task sets the threshold", "Spraying and autonomy need tighter positioning than routine work."],
] as const;

function isTyping(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** Global demo shortcuts (1–5 presets, R run, P presenter bar) plus the presenter bar itself. */
export function PresenterLayer() {
  const { applyPreset, runAssessment } = useAssessment();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const n = Number(e.key);
      const preset = Number.isInteger(n) && n >= 1 ? SCENARIO_PRESETS[n - 1] : undefined;
      if (preset) {
        applyPreset(preset.id);
      } else if (e.key === "r" || e.key === "R") {
        runAssessment();
      } else if (e.key === "p" || e.key === "P") {
        setOpen((o) => !o);
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyPreset, runAssessment]);

  if (!open) return null;
  return (
    <div role="region" aria-label="Presenter guide" className="fixed inset-x-3 bottom-3 z-40 animate-fade-up lg:left-[260px]">
      <div className="panel-strong flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <p className="eyebrow shrink-0 text-signal">60-second pitch</p>
        <ol className="grid flex-1 gap-3 md:grid-cols-3">
          {POINTS.map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="font-mono text-sm text-highlight">0{i + 1}</span>
              <span>
                <span className="block text-sm font-medium">{t}</span>
                <span className="block text-xs text-muted-foreground">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground xl:inline">
            1–5 scenarios · R run · P hide
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close presenter guide" className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function KeyChip({ k }: { k: string }) {
  return (
    <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[0.6rem] leading-4 text-muted-foreground">{k}</kbd>
  );
}
