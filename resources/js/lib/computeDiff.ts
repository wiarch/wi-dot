import { diffLines } from 'diff';
import type { DiffLine, DiffStats } from '@/types/dotfile';

export function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  const changes = diffLines(oldCode, newCode, { newlineIsToken: false });
  const rows: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const lines = splitLines(change.value);

    for (const line of lines) {
      if (change.added) {
        rows.push({
          type: 'added',
          content: line,
          oldLineNumber: null,
          newLineNumber: newLine,
        });
        newLine += 1;
      } else if (change.removed) {
        rows.push({
          type: 'removed',
          content: line,
          oldLineNumber: oldLine,
          newLineNumber: null,
        });
        oldLine += 1;
      } else {
        rows.push({
          type: 'unchanged',
          content: line,
          oldLineNumber: oldLine,
          newLineNumber: newLine,
        });
        oldLine += 1;
        newLine += 1;
      }
    }
  }

  return rows;
}

export function computeDiffStats(lines: DiffLine[]): DiffStats {
  return lines.reduce<DiffStats>(
    (stats, line) => {
      if (line.type === 'added') {
        stats.added += 1;
      } else if (line.type === 'removed') {
        stats.removed += 1;
      } else {
        stats.unchanged += 1;
      }

      return stats;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}

/** diffLines incluye newline final como línea vacía; normalizamos. */
function splitLines(value: string): string[] {
  const parts = value.split('\n');

  if (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }

  return parts;
}
