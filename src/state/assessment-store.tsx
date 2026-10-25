import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  assess,
  DEFAULT_INPUT,
  DEFAULT_PRESET_ID,
  getPreset,
  matchPreset,
  type Assessment,
  type AssessmentInput,
  type PresetId,
} from "@/lib/engine";

export interface Snapshot {
  input: AssessmentInput;
  label: string;
}

interface AssessmentStore {
  input: AssessmentInput;
  assessment: Assessment;
  presetId: PresetId | null;
  scenarioLabel: string;
  baseline: Snapshot;
  baselineAssessment: Assessment;
  /** Increments on every recalculation so the UI can show "Assessment updated". */
  updateTick: number;
  lastRunAt: string | null;
  setField: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void;
  applyPreset: (id: PresetId) => void;
  runAssessment: () => void;
  resetInputs: () => void;
  resetScenario: () => void;
}

const Ctx = createContext<AssessmentStore | null>(null);

function labelFor(input: AssessmentInput) {
  const id = matchPreset(input);
  return id ? `Scenario ${id} · ${getPreset(id).short}` : "Custom inputs";
}

const DEFAULT_SNAPSHOT: Snapshot = { input: DEFAULT_INPUT, label: labelFor(DEFAULT_INPUT) };

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<AssessmentInput>(DEFAULT_INPUT);
  const [baseline, setBaseline] = useState<Snapshot>(DEFAULT_SNAPSHOT);
  const [updateTick, setUpdateTick] = useState(0);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const assessment = useMemo(() => assess(input), [input]);
  const baselineAssessment = useMemo(() => assess(baseline.input), [baseline]);
  const presetId = matchPreset(input);

  const setField = useCallback<AssessmentStore["setField"]>((key, value) => {
    setInput((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    setUpdateTick((t) => t + 1);
  }, []);

  const applyPreset = useCallback(
    (id: PresetId) => {
      setBaseline({ input, label: labelFor(input) });
      setInput(getPreset(id).input);
      setUpdateTick((t) => t + 1);
    },
    [input],
  );

  const runAssessment = useCallback(() => {
    setBaseline({ input, label: "Last run" });
    setLastRunAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setUpdateTick((t) => t + 1);
  }, [input]);

  const resetInputs = useCallback(() => {
    setBaseline({ input, label: labelFor(input) });
    setInput(getPreset(DEFAULT_PRESET_ID).input);
    setUpdateTick((t) => t + 1);
  }, [input]);

  const resetScenario = useCallback(() => {
    setInput(DEFAULT_INPUT);
    setBaseline(DEFAULT_SNAPSHOT);
    setLastRunAt(null);
    setUpdateTick((t) => t + 1);
  }, []);

  const value: AssessmentStore = {
    input,
    assessment,
    presetId,
    scenarioLabel: labelFor(input),
    baseline,
    baselineAssessment,
    updateTick,
    lastRunAt,
    setField,
    applyPreset,
    runAssessment,
    resetInputs,
    resetScenario,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssessment() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssessment must be used inside AssessmentProvider");
  return ctx;
}
