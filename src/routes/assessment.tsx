import { createFileRoute } from "@tanstack/react-router";

import { DataQualityPanel, FactorTable, RulesApplied } from "@/components/khet/AssessmentDetails";
import { AssessmentSteps } from "@/components/khet/AssessmentSteps";
import { EvidenceTimeline } from "@/components/khet/EvidenceTimeline";
import { RationalePanel } from "@/components/khet/RationalePanel";
import { RecommendationPanel } from "@/components/khet/RecommendationPanel";
import { Reveal } from "@/components/khet/Reveal";
import { ScenarioSwitcher } from "@/components/khet/ScenarioSwitcher";
import { DispatchExportButton } from "@/components/khet/DispatchExportModal";
import { FieldDriftVisualizer } from "@/components/khet/FieldDriftVisualizer";
import { PageHeader } from "@/components/khet/primitives";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Live Assessment — KhetSignal" },
      { name: "description", content: "Full readout of the current KhetSignal assessment: factors, rules applied, data quality and rationale." },
      { property: "og:title", content: "Live Assessment — KhetSignal" },
      { property: "og:description", content: "Every factor and rule behind the current navigation recommendation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live assessment · simulated feed"
        title="The full reasoning, nothing hidden."
        description="Every factor, rule and data-quality check behind the current recommendation."
        aside={
          <div className="flex min-w-0 flex-col gap-3 lg:items-end">
            <ScenarioSwitcher />
            <DispatchExportButton />
          </div>
        }
      />
      <AssessmentSteps />
      <Reveal>
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <RecommendationPanel />
          <RulesApplied />
        </div>
      </Reveal>
      <Reveal delay={60}>
        <FieldDriftVisualizer />
      </Reveal>
      <Reveal delay={80}>
        <FactorTable />
      </Reveal>
      <Reveal delay={120}>
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <EvidenceTimeline height={240} />
          <DataQualityPanel />
        </div>
      </Reveal>
      <Reveal delay={160}>
        <RationalePanel />
      </Reveal>
    </div>
  );
}
