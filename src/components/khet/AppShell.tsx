import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, BookOpenText, FlaskConical, Info, LayoutDashboard, RotateCcw } from "lucide-react";

import { useAssessment } from "@/state/assessment-store";
import { RECOMMENDATION_LABEL } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { Wordmark, LogoMark } from "./Wordmark";
import { StarField } from "./StarField";
import { SEVERITY_STYLE } from "./severity";
import { PresenterLayer } from "./PresenterLayer";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/assessment", label: "Live Assessment", icon: Activity },
  { to: "/lab", label: "Scenario Lab", icon: FlaskConical },
  { to: "/method", label: "Evidence & Method", icon: BookOpenText },
  { to: "/about", label: "About", icon: Info },
] as const;


function CurrentChip() {
  const { assessment, scenarioLabel } = useAssessment();
  const s = SEVERITY_STYLE[assessment.severity];
  return (
    <Link
      to="/assessment"
      className={cn(
        "hidden items-center gap-3 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-secondary/60 md:inline-flex",
        s.border,
      )}
    >
      <span className="text-muted-foreground">{scenarioLabel}</span>
      <span className="h-3 w-px bg-border" aria-hidden />
      <span className={cn("font-semibold uppercase tracking-wide", s.text)}>
        {RECOMMENDATION_LABEL[assessment.recommendation]}
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { resetScenario } = useAssessment();
  return (
    <div className="min-h-screen">
      <StarField />
      <PresenterLayer />
      <Toaster />
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Link to="/" aria-label="KhetSignal overview">
            <Wordmark />
          </Link>
        </div>
        <div className="horizon-line mx-6 opacity-60" />
        <nav className="mt-6 flex flex-col gap-1 px-3" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-[0.95rem] text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
              activeProps={{
                className: "!border-border-strong !bg-sidebar-accent !text-foreground glow-signal",
              }}
            >
              <Icon className="size-[18px] text-signal/80 group-hover:text-signal" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 p-5">
          <button
            type="button"
            onClick={resetScenario}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" aria-hidden /> Reset scenario
          </button>
          <p className="text-center font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">Keys: 1–5 scenarios · R run · P presenter</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/75 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-10">
            <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="KhetSignal overview">
              <LogoMark className="size-7" />
              <span className="font-display text-xl">
                Khet<span className="text-signal">Signal</span>
              </span>
            </Link>
            <div className="hidden lg:block">
              <CurrentChip />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden" aria-label="Main mobile">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 text-sm text-muted-foreground"
                activeProps={{ className: "!border-border-strong !text-foreground bg-secondary" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full min-w-0 overflow-x-clip max-w-[1320px] px-5 pb-16 pt-8 md:px-10">{children}</main>

        <footer className="border-t border-border px-5 py-6 md:px-10">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
            Decision support only — not a safety certification · Data provenance in{" "}
            <Link to="/method" className="text-signal/90 underline decoration-dotted underline-offset-4">
              Evidence &amp; Method
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
