import { useMemo } from 'react';
import type { DotfileEntry } from '@/types/dotfile';
import { computeDiff, computeDiffStats } from '@/lib/computeDiff';

export function useDiffViewer(file: DotfileEntry | undefined) {
  const lines = useMemo(() => {
    if (!file) {
      return [];
    }

    return computeDiff(file.oldCode, file.newCode);
  }, [file]);

  const stats = useMemo(() => computeDiffStats(lines), [lines]);

  return { lines, stats };
}
