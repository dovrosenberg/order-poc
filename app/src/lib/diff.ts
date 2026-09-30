export interface DiffLine { kind: 'same' | 'add' | 'del'; text: string }

/** Line diff by longest common subsequence. Inputs here are prompt files of a few dozen lines. */
export function lineDiff(a: string, b: string): DiffLine[] {
  const x = a.split('\n'), y = b.split('\n');
  const n = x.length, m = y.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i]![j] = x[i] === y[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) { out.push({ kind: 'same', text: x[i]! }); i++; j++; }
    else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) out.push({ kind: 'del', text: x[i++]! });
    else out.push({ kind: 'add', text: y[j++]! });
  }
  while (i < n) out.push({ kind: 'del', text: x[i++]! });
  while (j < m) out.push({ kind: 'add', text: y[j++]! });
  return out;
}

/** Parse a unified git diff into lines, dropping the file headers. */
export function parseUnified(diff: string): DiffLine[] {
  return diff.split('\n')
    .filter((l) => !/^(diff --git|index |--- |\+\+\+ )/.test(l) && l !== '')
    .map((l) => (l.startsWith('@@') ? { kind: 'same' as const, text: l }
      : l.startsWith('+') ? { kind: 'add' as const, text: l.slice(1) }
      : l.startsWith('-') ? { kind: 'del' as const, text: l.slice(1) }
      : { kind: 'same' as const, text: l.slice(1) }));
}
