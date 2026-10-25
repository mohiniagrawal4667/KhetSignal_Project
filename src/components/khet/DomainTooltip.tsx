import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const GLOSSARY = {
  kp: ["Kp index", "A 0–9 global measure of geomagnetic disturbance; higher values mean a more active space-weather environment."],
  xray: ["Solar flare X-ray flux", "Brightness of solar X-rays; strong flares can briefly disturb the sunlit ionosphere that GNSS signals pass through."],
  s4: ["Ionospheric scintillation (S4)", "Rapid fluctuation of signal strength caused by ionospheric irregularities; S4 above ~0.5 is strong."],
  rtk: ["RTK fix vs. float", "A 'fix' resolves carrier-phase ambiguity for centimetre accuracy; 'float' has not, so accuracy is decimetres."],
  hdop: ["HDOP", "Horizontal dilution of precision — how satellite geometry amplifies position error; lower is better."],
  l1l2: ["L1/L2 multi-frequency", "Receivers using two frequencies can cancel most ionospheric delay; losing one weakens that correction."],
  cycleslip: ["Cycle slip", "A sudden jump in the tracked carrier phase that forces an RTK receiver to re-solve its fix."],
  xte: ["Cross-track error (XTE)", "Sideways distance between the implement and its planned guidance line."],
  envelope: ["Drift tolerance envelope", "The maximum cross-track error a task can accept before overlap or skips become a problem."],
  interlock: ["Autonomous interlock", "A safeguard that pauses autonomous operation when positioning evidence does not meet the task threshold."],
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;

export function DomainTooltip({ term, children }: { term: GlossaryKey; children?: ReactNode }) {
  const [title, body] = GLOSSARY[term];
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
          >
            {children ?? title}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs border border-border-strong bg-popover text-popover-foreground normal-case tracking-normal">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-[0.8rem] leading-snug text-muted-foreground">{body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
