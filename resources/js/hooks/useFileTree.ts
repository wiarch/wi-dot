import { useMemo, useState, useCallback } from 'react';
import type { DotfileEntry, TreeNode } from '@/types/dotfile';
import { buildFileTree, findFileById } from '@/lib/buildFileTree';

export function useFileTree(files: DotfileEntry[]) {
  const tree = useMemo(() => buildFileTree(files), [files]);
  const [selectedId, setSelectedId] = useState<string>(files[0]?.id ?? '');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const initial = new Set<string>(['~']);

    for (const file of files) {
      const segments = file.path.replace(/^~\/?/, '').split('/').filter(Boolean);
      let path = '~';

      for (let i = 0; i < segments.length - 1; i += 1) {
        path += `/${segments[i]}`;
        initial.add(path);
      }
    }

    return initial;
  });

  const selectedFile = useMemo(
    () => findFileById(files, selectedId),
    [files, selectedId],
  );

  const toggleFolder = useCallback((path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  }, []);

  const selectFile = useCallback((file: DotfileEntry) => {
    setSelectedId(file.id);
  }, []);

  const isExpanded = useCallback(
    (path: string) => expandedPaths.has(path),
    [expandedPaths],
  );

  return {
    tree,
    selectedFile,
    selectedId,
    selectFile,
    toggleFolder,
    isExpanded,
  };
}

export type FileTreeState = ReturnType<typeof useFileTree>;

export function flattenVisibleFiles(nodes: TreeNode[]): DotfileEntry[] {
  const result: DotfileEntry[] = [];

  const walk = (items: TreeNode[]) => {
    for (const node of items) {
      if (node.type === 'file' && node.file) {
        result.push(node.file);
      } else {
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return result;
}
