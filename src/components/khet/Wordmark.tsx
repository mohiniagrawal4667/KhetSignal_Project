export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none">
      <circle cx="20" cy="20" r="18.5" className="stroke-border-strong" strokeWidth="1" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="7"
        transform="rotate(-24 20 20)"
        className="stroke-signal"
        strokeWidth="1"
        strokeOpacity="0.8"
      />
      <path d="M9 27 L31 27 M11 31 L29 31 M14 23 L26 23" className="stroke-highlight" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="33" cy="12" r="2.2" className="fill-signal" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-none">
        <p className="font-display text-[1.6rem] tracking-tight">
          Khet<span className="text-signal">Signal</span>
        </p>
        <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
          Field navigation intelligence
        </p>
      </div>
    </div>
  );
}
