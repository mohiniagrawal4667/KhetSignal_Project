import { createFileRoute } from "@tanstack/react-router";

import { ChangePanel } from "@/components/khet/ChangePanel";
import { LabControls, PresetPicker } from "@/components/khet/LabControls";
import { Reveal } from "@/components/khet/Reveal";
import { ResultCard } from "@/components/khet/ResultCard";
import { DispatchExportButton } from "@/components/khet/DispatchExportModal";
import { Eyebrow, PageHeader, Panel } from "@/components/khet/primitives";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Scenario Lab — KhetSignal" },
      { name: "description", content: "Change space-weather, receiver and task inputs and watch the deterministic decision engine respond." },
      { property: "og:title", content: "Scenario Lab — KhetSignal" },
      { property: "og:description", content: "Interactive simulator for KhetSignal's explainable decision rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabPage,
});

function LabPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scenario lab"
        title="Change the evidence. Watch the reasoning move."
        description="Pick a preset or set every input yourself. The deterministic engine recalculates instantly."
        aside={<DispatchExportButton />}
      />
      <Reveal>
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <Panel className="p-6">
              <Eyebrow>Preset scenarios</Eyebrow>
              <div className="mt-4">
                <PresetPicker />
              </div>
            </Panel>
            <LabControls />
          </div>
          <div className="min-w-0 space-y-6">
            <ResultCard />
            <ChangePanel />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
