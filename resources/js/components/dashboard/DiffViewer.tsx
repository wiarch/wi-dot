import { useMemo } from 'react';
import type { DiffLine } from '@/types/dotfile';

interface DiffViewerProps {
  lines: DiffLine[];
  filename: string;
}

export function DiffViewer({ lines, filename }: DiffViewerProps) {
  const hasChanges = useMemo(
    () => lines.some((line) => line.type !== 'unchanged'),
    [lines],
  );

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
        Sin contenido para comparar.
      </div>
    );
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label={`Diff de ${filename}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-500">
        <span className="font-mono">{filename}</span>
        <span>{hasChanges ? 'Versión anterior → actual' : 'Sin diferencias'}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-6">
          <tbody>
            {lines.map((line, index) => (
              <DiffRow key={`${line.type}-${index}-${line.oldLineNumber}-${line.newLineNumber}`} line={line} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DiffRow({ line }: { line: DiffLine }) {
  const rowStyles = {
    unchanged: 'bg-transparent',
    added: 'bg-emerald-500/10',
    removed: 'bg-red-500/10',
  }[line.type];

  const prefixStyles = {
    unchanged: 'text-zinc-600',
    added: 'text-emerald-400',
    removed: 'text-red-400',
  }[line.type];

  const contentStyles = {
    unchanged: 'text-zinc-300',
    added: 'text-emerald-100',
    removed: 'text-red-100',
  }[line.type];

  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' ';

  return (
    <tr className={`group ${rowStyles}`}>
      <td className="w-12 select-none border-r border-zinc-800/50 px-2 text-right align-top text-zinc-600 tabular-nums">
        {line.oldLineNumber ?? ''}
      </td>
      <td className="w-12 select-none border-r border-zinc-800/50 px-2 text-right align-top text-zinc-600 tabular-nums">
        {line.newLineNumber ?? ''}
      </td>
      <td className={`w-8 select-none px-2 text-center align-top ${prefixStyles}`}>
        {prefix}
      </td>
      <td className={`whitespace-pre-wrap break-all px-3 align-top ${contentStyles}`}>
        {line.content === '' ? '\u00A0' : line.content}
      </td>
    </tr>
  );
}
