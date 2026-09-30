// Shape of the build-time module `virtual:phase1`, produced by app/phase1.ts from poc/data, poc/runs and poc/LOG.md.
import type {
  AnswerKeyEntry, Classification, Extraction, Flag, InboundRequest, LineMatch, MasterData,
} from '../../poc/domain/types';

export type CsvTable = { columns: string[]; rows: Record<string, string>[] };

export interface Metric { hit: number; total: number; pct: string }
export interface Metrics { classification: Metric; sku: Metric; qtyUnit: Metric; flagRecall: Metric }
export interface Miss { requestId: string; cause: string; expected: string; got: string; detail: string }

export interface ResultRow {
  requestId: string; line: number; text: string; qty: string; unit: string; sku: string;
  confidence: number; sellQty: string; sellUnit: string; plants: string;
  unitPrice: number; extPrice: number; flags: string[]; reason: string;
  skuOk: boolean; qtyOk: boolean;
}

export interface RecordedSteps {
  classify: { result: Classification; reason?: string };
  extract?: { result: Extraction };
  match?: { result: LineMatch[] };
  draft?: { result: string };
}

export interface RequestResult {
  requestId: string; classification: Classification; flags: Flag[];
  steps: RecordedSteps;
  draft: { header: string; body: string } | null;
  totals: { subtotal: number; freight: number; total: number } | null;
}

export interface RunData {
  name: string;
  promptVersion: string;
  rows: ResultRow[];
  requests: RequestResult[];
  metrics: Metrics;
  misses: Miss[];
  scorecardMatchesCommitted: boolean;
}

export interface LogEntry { time: string; text: string }

/** One prompt from poc/prompt-log.txt: the developer's own record of what they typed into Claude Code. */
export interface DevPrompt { time: string; context: string | null; prompt: string; notes: string[] }
export interface DevLog { title: string; prompts: DevPrompt[]; notes: LogEntry[] }

export interface Phase1Data {
  master: MasterData;
  tables: Record<'products' | 'aliases' | 'spec_crosswalk' | 'customers' | 'inventory', CsvTable>;
  requests: InboundRequest[];
  samples: InboundRequest[];
  answerKey: AnswerKeyEntry[];
  prompts: Record<'v1' | 'v2', Record<'classify' | 'extract' | 'match' | 'draft', string>>;
  runs: { run1: RunData; run2: RunData };
  log: { clockStart: string; entries: LogEntry[] };
  devLog: DevLog | null;
  flagsFixDiff: string;
}
