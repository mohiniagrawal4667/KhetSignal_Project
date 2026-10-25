import { DomainTooltip, GLOSSARY, type GlossaryKey } from "@/components/khet/DomainTooltip";
import { createFileRoute } from "@tanstack/react-router";
import { Orbit, SatelliteDish } from "lucide-react";

import { Reveal } from "@/components/khet/Reveal";
import { BulletList, Eyebrow, PageHeader, Panel, SimulatedTag } from "@/components/khet/primitives";
import { DEFAULT_TASK_POLICY, RULES, TASK_OPTIONS } from "@/lib/engine";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Evidence & Method — KhetSignal" },
      { name: "description", content: "How KhetSignal separates space-weather context from receiver evidence, checks data quality and applies task policy." },
      { property: "og:title", content: "Evidence & Method — KhetSignal" },
      { property: "og:description", content: "Two channels, kept separate. Transparent rules, documented limits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodPage,
});

const SOURCES = [
  ["NOAA SWPC", "Space-weather context", "Geomagnetic and solar activity alerts and indices."],
  ["NASA CCMC DONKI", "Space-weather context", "Catalogue of space-weather events and notifications."],
  ["IGS", "GNSS research", "Global reference-station observations and products."],
  ["NASA CDDIS", "GNSS research", "Archive of geodetic and GNSS data."],
  ["OpenMadrigal", "Ionospheric research", "Upper-atmosphere and ionospheric datasets."],
];

const PROVENANCE = [
  ["Space-weather exposure", "Scenario-defined", "Illustrative regional index", "T−0 (session)"],
  ["Navigation health", "Simulated receiver", "Prototype generator", "T−3 min"],
  ["Fix status", "Simulated receiver", "Prototype generator", "T−3 min"],
  ["Signal quality", "Simulated receiver", "Prototype generator", "T−3 min"],
  ["Task & obstruction", "Operator input", "Scenario Lab controls", "This session"],
];

function MethodPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evidence & method"
        title="Two channels, kept deliberately separate."
        description="Exposure tells us what the environment might do. Receiver evidence tells us what navigation is actually doing."
      />
      <Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Panel className="p-7">
            <Orbit className="size-6 text-highlight" aria-hidden />
            <Eyebrow className="mt-4">Channel A · Environmental exposure</Eyebrow>
            <h2 className="mt-2 font-display text-3xl">Space-weather context</h2>
            <p className="mt-3 text-muted-foreground">Quiet, elevated or high. Raises monitoring attention, but is never treated as proof that a receiver is affected.</p>
          </Panel>
          <Panel className="p-7">
            <SatelliteDish className="size-6 text-signal" aria-hidden />
            <Eyebrow className="mt-4">Channel B · Observed navigation health</Eyebrow>
            <h2 className="mt-2 font-display text-3xl">Receiver evidence</h2>
            <p className="mt-3 text-muted-foreground">Fix status, signal quality, position variation and receiver telemetry. Only this channel can show degradation.</p>
          </Panel>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel className="p-7">
            <Eyebrow>Quality checks</Eyebrow>
            <div className="mt-4">
              <BulletList
                items={[
                  "Timestamps: every receiver record must fall inside the assessment window.",
                  "Freshness: records older than 45 min are stale; none at all is missing — receiver fields are then ignored, not guessed.",
                  "Missing fields: unreported fix or signal quality is listed as an evidence gap.",
                  "Geographic & time alignment: exposure is regional; alignment to the receiver is a known prototype limitation.",
                ]}
              />
            </div>
          </Panel>
          <Panel className="overflow-hidden p-0">
            <div className="px-7 pt-6">
              <Eyebrow>Task policy (configurable)</Eyebrow>
            </div>
            <table className="mt-3 w-full text-left text-[0.92rem]">
              <thead>
                <tr className="border-y border-border bg-background/40">
                  {["Task", "Dependence", "Signal min"].map((h) => (
                    <th key={h} className="px-7 py-2.5 eyebrow text-[0.6rem] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TASK_OPTIONS.map((t) => (
                  <tr key={t} className="border-b border-border/60 last:border-0">
                    <td className="px-7 py-3 font-medium">{DEFAULT_TASK_POLICY[t].label}</td>
                    <td className="px-7 py-3 capitalize text-muted-foreground">{DEFAULT_TASK_POLICY[t].dependence}</td>
                    <td className="px-7 py-3 font-mono text-highlight">{DEFAULT_TASK_POLICY[t].minSignalQuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <Panel className="p-7">
          <Eyebrow>Decision rules</Eyebrow>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {Object.values(RULES).map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-background/40 p-4">
                <p className="font-mono text-xs text-signal">{r.id}</p>
                <p className="mt-1 font-medium">{r.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={160}>
        <Panel className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-7 pt-6">
            <Eyebrow>Sample evidence provenance</Eyebrow>
            <SimulatedTag />
          </div>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full min-w-[560px] text-left text-[0.92rem]">
              <thead>
                <tr className="border-y border-border bg-background/40">
                  {["Field", "Origin", "Generator", "Timestamp"].map((h) => (
                    <th key={h} className="px-7 py-2.5 eyebrow text-[0.6rem] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROVENANCE.map((row) => (
                  <tr key={row[0]} className="border-b border-border/60 last:border-0">
                    {row.map((c, i) => (
                      <td key={i} className={i === 0 ? "px-7 py-3 font-medium" : "px-7 py-3 text-muted-foreground"}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={200}>
        <div>
          <Eyebrow>Candidate data sources</Eyebrow>
          <div className="mt-3 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {SOURCES.map(([name, kind, desc]) => (
              <Panel key={name} className="p-5">
                <SimulatedTag>Candidate · not connected</SimulatedTag>
                <p className="mt-3 font-medium">{name}</p>
                <p className="text-xs text-signal">{kind}</p>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </Panel>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={220}>
        <Panel className="p-7">
          <Eyebrow>Glossary · hover or focus a term</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-[0.95rem]">
            {(Object.keys(GLOSSARY) as GlossaryKey[]).map((k) => (
              <DomainTooltip key={k} term={k} />
            ))}
          </div>
        </Panel>
      </Reveal>
      <Reveal delay={240}>
        <Panel className="p-7">
          <Eyebrow>Limitations</Eyebrow>
          <div className="mt-4">
            <BulletList
              tone="highlight"
              items={[
                "Public reference-station data may not represent a tractor-mounted receiver.",
                "Simulated data only tests software behaviour, not real-world accuracy.",
                "Any causal link between space weather and receiver degradation needs independent validation.",
                "Field use requires validation and approved operating procedures. This prototype is not a safety certification.",
              ]}
            />
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
