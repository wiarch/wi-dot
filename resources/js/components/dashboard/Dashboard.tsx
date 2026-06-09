import { useCallback, useState } from 'react';
import { FileTreeSidebar } from '@/components/dashboard/FileTreeSidebar';
import { FileMetadataHeader } from '@/components/dashboard/FileMetadataHeader';
import { DiffViewer } from '@/components/dashboard/DiffViewer';
import { Menu, Shield } from '@/components/icons';
import { MOCK_DOTFILES } from '@/lib/mockData';
import { useFileTree } from '@/hooks/useFileTree';
import { useDiffViewer } from '@/hooks/useDiffViewer';
import type { DotfileEntry } from '@/types/dotfile';

export function Dashboard() {
  const {
    tree,
    selectedFile,
    selectedId,
    selectFile,
    toggleFolder,
    isExpanded,
  } = useFileTree(MOCK_DOTFILES);

  const { lines, stats } = useDiffViewer(selectedFile);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleDownloadEncrypted = useCallback((file: DotfileEntry) => {
    const mockPayload = {
      note: 'Blob cifrado simulado — en producción vendría del backend sin descifrar.',
      filename: file.encryptedBlobName,
      path: file.path,
      encrypted_payload: {
        v: 1,
        alg: 'AES-256-GCM',
        salt: 'base64...',
        iv: 'base64...',
        ciphertext: 'base64...',
        tag: 'base64...',
      },
    };

    const blob = new Blob([JSON.stringify(mockPayload, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.encryptedBlobName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <TopBar onOpenSidebar={() => setMobileSidebarOpen(true)} />

      <div className="relative flex min-h-0 flex-1">
        {/* Sidebar desktop */}
        <div className="hidden w-72 shrink-0 lg:block xl:w-80">
          <FileTreeSidebar
            tree={tree}
            selectedId={selectedId}
            isExpanded={isExpanded}
            onToggleFolder={toggleFolder}
            onSelectFile={selectFile}
          />
        </div>

        {/* Sidebar mobile overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Cerrar explorador"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs shadow-2xl">
              <FileTreeSidebar
                tree={tree}
                selectedId={selectedId}
                isExpanded={isExpanded}
                onToggleFolder={toggleFolder}
                onSelectFile={selectFile}
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Panel central */}
        <main className="flex min-w-0 flex-1 flex-col">
          <FileMetadataHeader
            file={selectedFile}
            stats={stats}
            onDownloadEncrypted={handleDownloadEncrypted}
          />

          <DiffViewer
            lines={lines}
            filename={selectedFile?.filename ?? 'archivo'}
          />
        </main>
      </div>
    </div>
  );
}

function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 lg:hidden"
          aria-label="Abrir explorador"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/20">
            <Shield className="size-4 text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">WI-Dot</p>
            <p className="text-[11px] text-zinc-500">Zero-Knowledge Dashboard</p>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 sm:flex">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Descifrado local activo
      </div>
    </header>
  );
}
