import { ChevronRight, FileText, Folder, FolderOpen } from '@/components/icons';
import type { TreeNode } from '@/types/dotfile';
import type { FileTreeState } from '@/hooks/useFileTree';

interface FileTreeSidebarProps {
  tree: TreeNode[];
  selectedId: string;
  isExpanded: (path: string) => boolean;
  onToggleFolder: (path: string) => void;
  onSelectFile: FileTreeState['selectFile'];
  onCloseMobile?: () => void;
}

export function FileTreeSidebar({
  tree,
  selectedId,
  isExpanded,
  onToggleFolder,
  onSelectFile,
  onCloseMobile,
}: FileTreeSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-zinc-800/80 bg-zinc-950/60">
      <div className="border-b border-zinc-800/80 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Dotfiles
        </p>
        <h2 className="mt-1 text-sm font-semibold text-zinc-100">Explorador</h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Árbol de archivos">
        <ul className="space-y-0.5">
          {tree.map((node) => (
            <TreeBranch
              key={node.fullPath}
              node={node}
              depth={0}
              selectedId={selectedId}
              isExpanded={isExpanded}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onCloseMobile={onCloseMobile}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

interface TreeBranchProps {
  node: TreeNode;
  depth: number;
  selectedId: string;
  isExpanded: (path: string) => boolean;
  onToggleFolder: (path: string) => void;
  onSelectFile: FileTreeState['selectFile'];
  onCloseMobile?: () => void;
}

function TreeBranch({
  node,
  depth,
  selectedId,
  isExpanded,
  onToggleFolder,
  onSelectFile,
  onCloseMobile,
}: TreeBranchProps) {
  const expanded = node.type === 'folder' && isExpanded(node.fullPath);
  const isSelected = node.type === 'file' && node.file?.id === selectedId;
  const paddingLeft = 8 + depth * 14;

  if (node.type === 'file' && node.file) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            onSelectFile(node.file!);
            onCloseMobile?.();
          }}
          className={[
            'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition',
            isSelected
              ? 'bg-zinc-800 text-zinc-50 shadow-sm ring-1 ring-zinc-700/60'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
          ].join(' ')}
          style={{ paddingLeft }}
        >
          <FileText
            className={[
              'size-4 shrink-0',
              isSelected ? 'text-sky-400' : 'text-zinc-600 group-hover:text-zinc-400',
            ].join(' ')}
          />
          <span className="truncate font-mono text-[13px]">{node.name}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onToggleFolder(node.fullPath)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-900"
        style={{ paddingLeft }}
      >
        <ChevronRight
          className={[
            'size-3.5 shrink-0 text-zinc-500 transition-transform',
            expanded ? 'rotate-90' : '',
          ].join(' ')}
        />
        {expanded ? (
          <FolderOpen className="size-4 shrink-0 text-amber-400/90" />
        ) : (
          <Folder className="size-4 shrink-0 text-amber-400/70" />
        )}
        <span className="truncate font-medium">{node.name}</span>
      </button>

      {expanded && node.children.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeBranch
              key={child.fullPath}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              isExpanded={isExpanded}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onCloseMobile={onCloseMobile}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
