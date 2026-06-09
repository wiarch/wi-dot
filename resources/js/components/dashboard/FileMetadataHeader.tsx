import { Download, GitCompare } from '@/components/icons';
import { formatBytes, formatDate } from '@/lib/mockData';
import type { DotfileEntry, DiffStats } from '@/types/dotfile';
import type { ReactNode } from 'react';

interface FileMetadataHeaderProps {
  file: DotfileEntry | undefined;
  stats: DiffStats;
  onDownloadEncrypted: (file: DotfileEntry) => void;
}

export function FileMetadataHeader({
  file,
  stats,
  onDownloadEncrypted,
}: FileMetadataHeaderProps) {
  if (!file) {
    return (
      <header className="border-b border-zinc-800/80 bg-zinc-950/40 px-5 py-8">
        <p className="text-sm text-zinc-500">Selecciona un archivo del árbol lateral.</p>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/40 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <GitCompare className="size-3.5 text-sky-400" />
            <span>Comparación de versiones (descifradas localmente)</span>
          </div>

          <h1 className="truncate font-mono text-base font-medium text-zinc-50 sm:text-lg">
            {file.path}
          </h1>

          <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <MetaItem label="Último respaldo" value={formatDate(file.backedUpAt)} />
            <MetaItem label="Tamaño" value={formatBytes(file.sizeBytes)} />
            <MetaItem label="Entorno" value={file.environment} />
            <MetaItem
              label="Cambios"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-400">+{stats.added}</span>
                  <span className="text-red-400">−{stats.removed}</span>
                </span>
              }
            />
          </dl>
        </div>

        <button
          type="button"
          onClick={() => onDownloadEncrypted(file)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
        >
          <Download className="size-4 text-zinc-400" />
          Descargar blob cifrado
        </button>
      </div>
    </header>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-200">{value}</dd>
    </div>
  );
}
