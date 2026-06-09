import type { DotfileEntry, TreeNode } from '@/types/dotfile';

/**
 * Construye árbol jerárquico desde rutas tipo ~/.config/hypr/hyprland.conf
 */
export function buildFileTree(files: DotfileEntry[]): TreeNode[] {
  const root: TreeNode = {
    name: '~',
    fullPath: '~',
    type: 'folder',
    children: [],
  };

  for (const file of files) {
    const normalized = file.path.replace(/^~\/?/, '');
    const segments = normalized.split('/').filter(Boolean);

    let current = root;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const isFile = index === segments.length - 1;
      const fullPath = `~/${segments.slice(0, index + 1).join('/')}`;

      if (isFile) {
        current.children.push({
          name: segment,
          fullPath,
          type: 'file',
          children: [],
          file,
        });
        continue;
      }

      let folder = current.children.find(
        (child) => child.type === 'folder' && child.name === segment,
      );

      if (!folder) {
        folder = {
          name: segment,
          fullPath,
          type: 'folder',
          children: [],
        };
        current.children.push(folder);
      }

      current = folder;
    }
  }

  return sortTree(root.children);
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: node.type === 'folder' ? sortTree(node.children) : [],
    }))
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
}

export function findFileById(
  files: DotfileEntry[],
  id: string,
): DotfileEntry | undefined {
  return files.find((file) => file.id === id);
}
