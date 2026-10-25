import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical } from "lucide-react";

import heroImg from "@/assets/orbit-fields.jpg";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/use-magnetic";
import { EvidenceCards } from "@/components/khet/EvidenceCards";
import { EvidenceTimeline } from "@/components/khet/EvidenceTimeline";
import { RationalePanel } from "@/components/khet/RationalePanel";
import { RecommendationPanel } from "@/components/khet/RecommendationPanel";
import { Reveal } from "@/components/khet/Reveal";
import { ScenarioSwitcher } from "@/components/khet/ScenarioSwitcher";
import { FieldDriftVisualizer } from "@/components/khet/FieldDriftVisualizer";
import { SignalFlow } from "@/components/khet/SignalFlow";
import { Eyebrow } from "@/components/khet/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KhetSignal — Field navigation intelligence" },
      { name: "description", content: "Explainable, task-aware GNSS guidance for agriculture that keeps space-weather context separate from receiver evidence." },
      { property: "og:title", content: "KhetSignal — Field navigation intelligence" },
      { property: "og:description", content: "From space-weather signals to safer field decisions — explainable, task-aware GNSS guidance for agriculture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const magnetic = useMagnetic();
  return (
    <div className="space-y-6">
      <section className="relative -mx-5 -mt-8 overflow-hidden px-5 pb-8 pt-10 md:-mx-10 md:px-10">
        <img src={heroImg} alt="" width={1920} height={1088} className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_40%] opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" aria-hidden />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between animate-fade-up">
          <div className="max-w-2xl">
            <Eyebrow className="text-signal">Field navigation intelligence</Eyebrow>
            <h1 className="mt-4 font-display-tight text-5xl md:text-[3.75rem]">
              From space-weather signals
              <br />
              to <span className="italic text-signal">safer field decisions.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              KhetSignal connects space-weather context, navigation-health evidence and agricultural task
              requirements to help operators understand when positioning needs attention.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div ref={magnetic.ref} onPointerMove={magnetic.onPointerMove} onPointerLeave={magnetic.onPointerLeave} className="magnetic inline-flex">
                <Button asChild size="lg" className="glow-signal">
                  <Link to="/assessment">
                    Open field assessment <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
              <Button asChild size="lg" variant="outline" className="bg-background/40">
                <Link to="/lab">
                  <FlaskConical aria-hidden /> Open scenario lab
                </Link>
              </Button>
            </div>
          </div>
          <ScenarioSwitcher />
        </div>
      </section>

      <Reveal>
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <RecommendationPanel />
          <SignalFlow />
        </div>
      </Reveal>
      <Reveal delay={60}>
        <FieldDriftVisualizer />
      </Reveal>
      <Reveal delay={80}>
        <EvidenceCards />
      </Reveal>
      <Reveal delay={120}>
        <RationalePanel />
      </Reveal>
      <Reveal delay={160}>
        <EvidenceTimeline />
      </Reveal>
    </div>
  );
}
