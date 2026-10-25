import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { RECOMMENDATION_LABEL, SEVERITY_LABEL, type Recommendation, type Severity } from "@/lib/engine";
import { SEVERITY_STYLE } from "./severity";

export function Panel({
  children,
  className,
  strong,
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  as?: "section" | "div" | "article" | "aside";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn(strong ? "panel-strong" : "panel", "relative", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SeverityBadge({ severity, size = "md" }: { severity: Severity; size?: "sm" | "md" | "lg" }) {
  const s = SEVERITY_STYLE[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-[0.14em]",
        s.text,
        s.soft,
        s.border,
        size === "sm" && "px-2.5 py-0.5 text-[0.68rem]",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-3.5 py-1.5 text-sm",
      )}
    >
      <span className={cn("size-1.5 rounded-full animate-pulse-soft", s.dot)} aria-hidden />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function RecommendationText({
  recommendation,
  severity,
  className,
}: {
  recommendation: Recommendation;
  severity: Severity;
  className?: string;
}) {
  return (
    <span className={cn("font-sans font-semibold uppercase tracking-[0.04em]", SEVERITY_STYLE[severity].text, className)}>
      {RECOMMENDATION_LABEL[recommendation]}
    </span>
  );
}

export function SimulatedTag({ children = "Simulated", className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-highlight/40 bg-highlight/10 px-2 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-highlight",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Briefly shows "Assessment updated" whenever `tick` changes (after the first render). */
export function UpdatedFlash({ tick, label = "Assessment updated" }: { tick: number; label?: string }) {
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    if (tick > 0) setShown(tick);
  }, [tick]);
  if (shown === null) return null;
  return (
    <span
      key={shown}
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-signal animate-flash"
    >
      <Check className="size-3" aria-hidden />
      {label}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between animate-fade-up">
      <div className="max-w-3xl">
        <Eyebrow className="text-signal">{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display-tight text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>}
      </div>
      {aside}
    </header>
  );
}

export function BulletList({ items, tone = "signal" }: { items: string[]; tone?: "signal" | "highlight" | "muted" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[0.95rem] leading-relaxed">
          <span
            aria-hidden
            className={cn(
              "mt-2.5 h-px w-3 shrink-0",
              tone === "signal" && "bg-signal",
              tone === "highlight" && "bg-highlight",
              tone === "muted" && "bg-muted-foreground",
            )}
          />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
