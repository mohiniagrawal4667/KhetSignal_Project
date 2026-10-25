import type { FactorEffect, Severity } from "@/lib/engine";

export const SEVERITY_STYLE: Record<
  Severity,
  { text: string; soft: string; border: string; dot: string; ring: string }
> = {
  routine: {
    text: "text-status-routine",
    soft: "bg-status-routine/10",
    border: "border-status-routine/40",
    dot: "bg-status-routine",
    ring: "ring-status-routine/30",
  },
  watch: {
    text: "text-status-watch",
    soft: "bg-status-watch/10",
    border: "border-status-watch/40",
    dot: "bg-status-watch",
    ring: "ring-status-watch/30",
  },
  elevated: {
    text: "text-status-elevated",
    soft: "bg-status-elevated/10",
    border: "border-status-elevated/40",
    dot: "bg-status-elevated",
    ring: "ring-status-elevated/30",
  },
  high: {
    text: "text-status-high",
    soft: "bg-status-high/10",
    border: "border-status-high/45",
    dot: "bg-status-high",
    ring: "ring-status-high/30",
  },
  gap: {
    text: "text-status-gap",
    soft: "bg-status-gap/10",
    border: "border-status-gap/40",
    dot: "bg-status-gap",
    ring: "ring-status-gap/30",
  },
};

export const EFFECT_STYLE: Record<FactorEffect, { label: string; className: string }> = {
  raises: { label: "Raises attention", className: "text-status-elevated border-status-elevated/40 bg-status-elevated/10" },
  supports: { label: "Supports reliability", className: "text-status-routine border-status-routine/40 bg-status-routine/10" },
  neutral: { label: "Context / neutral", className: "text-muted-foreground border-border bg-muted/40" },
  gap: { label: "Evidence gap", className: "text-status-gap border-status-gap/40 bg-status-gap/10" },
  ignored: { label: "Ignored", className: "text-muted-foreground border-border bg-transparent line-through decoration-muted-foreground/50" },
};
