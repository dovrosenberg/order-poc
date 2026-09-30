// Phase 1 commits, copied from `git log` (times local, 2026-09-30).
// Kept static because hosted builds may use a shallow clone without this history.
export const COMMITS: { time: string; hash: string; subject: string }[] = [
  { time: '17:54', hash: '2159a46', subject: 'Add domain types and simulated NAF data' },
  { time: '17:56', hash: '3042c50', subject: 'updated spec to point to live model sample file' },
  { time: '17:57', hash: '61acd33', subject: 'poc: scaffold package, contract types, LOG' },
  { time: '18:00', hash: '60daab5', subject: 'poc: domain, llm, run.ts, score.ts' },
  { time: '18:02', hash: 'ac15aca', subject: 'poc: log API credit block' },
  { time: '18:08', hash: 'd8ecfa4', subject: 'poc: run-01 results and scorecard' },
  { time: '18:09', hash: 'eeaa1eb', subject: 'poc: v2 prompts (implicit EA, rating substitution), end-of-day need-by fix' },
  { time: '18:13', hash: 'b308814', subject: 'poc: run-02 results and scorecard' },
  { time: '18:14', hash: '1c73108', subject: 'poc: README with run instructions' },
];
