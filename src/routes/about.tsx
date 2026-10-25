import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/khet/Reveal";
import { BulletList, Eyebrow, PageHeader, Panel, SimulatedTag } from "@/components/khet/primitives";
import { DEFAULT_ENGINE_CONFIG } from "@/lib/engine";
import { useAssessment } from "@/state/assessment-store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — KhetSignal" },
      { name: "description", content: "Who KhetSignal is for, what it does, and the boundaries it never crosses." },
      { property: "og:title", content: "About — KhetSignal" },
      { property: "og:description", content: "Decision support for agricultural GNSS — with clear boundaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { resetScenario } = useAssessment();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="About"
        title="Built for the people in the field."
        description="Farm operators, agronomy service providers and precision-ag teams who need to know when to trust GNSS — and when to check."
        aside={<SimulatedTag>Engine v{DEFAULT_ENGINE_CONFIG.version}</SimulatedTag>}
      />
      <Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Panel className="p-7">
            <Eyebrow>What it does</Eyebrow>
            <div className="mt-4">
              <BulletList items={["Combines space-weather context, receiver evidence and task requirements.", "Returns a conditional, explainable recommendation with the rules used.", "Flags missing or stale data instead of guessing.", "Runs fully in the browser — no login, no external services."]} />
            </div>
          </Panel>
          <Panel className="p-7">
            <Eyebrow>Boundaries</Eyebrow>
            <div className="mt-4">
              <BulletList tone="highlight" items={["Does not claim space weather caused any receiver fault.", "Does not control or authorize machinery.", "Is not a safety certification.", "Gives no risk percentage or AI confidence score."]} />
            </div>
          </Panel>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <Panel strong className="flex flex-col items-start justify-between gap-4 p-7 md:flex-row md:items-center">
          <div>
            <Eyebrow>Scenario controls</Eyebrow>
            <p className="mt-2 text-muted-foreground">Restore the default scenario (B · High exposure, degraded GNSS) and clear comparisons.</p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              resetScenario();
              toast.success("Scenario reset to B");
            }}
          >
            <RotateCcw aria-hidden /> Reset scenario
          </Button>
        </Panel>
      </Reveal>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Simulated evidence · provenance and limitations in Evidence &amp; Method</p>
    </div>
  );
}
