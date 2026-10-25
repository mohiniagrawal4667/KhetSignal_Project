import { useMemo, useState } from "react";
import { Copy, Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAssessment } from "@/state/assessment-store";
import {
  EXPOSURE_LABEL,
  FIX_LABEL,
  FRESHNESS_LABEL,
  NAV_LABEL,
  RECOMMENDATION_LABEL,
  SEVERITY_LABEL,
  TASK_LABEL,
} from "@/lib/engine";
import { Eyebrow, SeverityBadge } from "./primitives";

function makeRef(d: Date) {
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const n = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `KHET-ADV-${ymd}-${n}`;
}

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function DispatchExportButton() {
  const { input, assessment } = useAssessment();
  const [open, setOpen] = useState(false);
  const [issued, setIssued] = useState(() => new Date());
  const ref = useMemo(() => makeRef(issued), [issued]);

  const feedMissing = input.freshness === "missing";
  const factors: [string, string][] = [
    ["Space-weather exposure", `${EXPOSURE_LABEL[input.exposure]} (context only)`],
    ["Receiver health", feedMissing ? "No data" : NAV_LABEL[input.navHealth]],
    ["Fix quality", feedMissing ? "Not reported" : `${FIX_LABEL[input.fixStatus]} · signal ${input.signalQuality ?? "n/r"}`],
    ["Data freshness", FRESHNESS_LABEL[input.freshness]],
  ];

  const markdown = [
    `*KhetSignal Field Navigation Advisory* — ${ref}`,
    `Issued: ${issued.toISOString()}`,
    `Task: ${TASK_LABEL[input.task]}`,
    ``,
    `*Recommendation:* ${RECOMMENDATION_LABEL[assessment.recommendation]} (${SEVERITY_LABEL[assessment.severity]})`,
    assessment.summary,
    ``,
    `*Evidence*`,
    ...factors.map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `*Action:* ${assessment.nextStep}`,
    ``,
    `*Not proven*`,
    ...assessment.notProven.map((t) => `- ${t}`),
    ``,
    `_${assessment.disclaimer}_`,
    `_Simulated data · not connected to live receiver telemetry._`,
  ].join("\n");

  const json = JSON.stringify(
    {
      reference: ref,
      issuedAt: issued.toISOString(),
      task: input.task,
      recommendation: assessment.recommendation,
      severity: assessment.severity,
      summary: assessment.summary,
      evidence: Object.fromEntries(factors),
      action: assessment.nextStep,
      notProven: assessment.notProven,
      rules: assessment.rules,
      disclaimer: assessment.disclaimer,
      simulated: true,
    },
    null,
    2,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Advisory copied", { description: ref });
    } catch {
      toast.error("Clipboard unavailable — use download instead");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setIssued(new Date());
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/40">
          <FileText aria-hidden /> Export advisory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Field navigation advisory</DialogTitle>
          <DialogDescription className="font-mono text-xs uppercase tracking-[0.12em]">
            {ref} · {issued.toISOString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Eyebrow className="text-[0.6rem]">Task</Eyebrow>
              <p className="mt-1 font-medium">{TASK_LABEL[input.task]}</p>
            </div>
            <SeverityBadge severity={assessment.severity} />
          </div>
          <div>
            <Eyebrow className="text-[0.6rem]">Recommendation</Eyebrow>
            <p className="mt-1 text-lg font-semibold uppercase">{RECOMMENDATION_LABEL[assessment.recommendation]}</p>
            <p className="mt-1 text-muted-foreground">{assessment.summary}</p>
          </div>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {factors.map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <dt className="eyebrow text-[0.6rem]">{k}</dt>
                <dd className="mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <Eyebrow className="text-[0.6rem]">Operational action</Eyebrow>
            <p className="mt-1">{assessment.nextStep}</p>
          </div>
          <div>
            <Eyebrow className="text-[0.6rem]">Not proven</Eyebrow>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {assessment.notProven.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">{assessment.disclaimer}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={copy}>
            <Copy aria-hidden /> Copy to clipboard
          </Button>
          <Button variant="outline" onClick={() => download(`${ref}.txt`, markdown, "text/plain")}>
            <Download aria-hidden /> .txt
          </Button>
          <Button variant="outline" onClick={() => download(`${ref}.json`, json, "application/json")}>
            <Download aria-hidden /> .json
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
