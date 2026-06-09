export interface DotfileEntry {
  id: string;
  path: string;
  filename: string;
  environment: string;
  backedUpAt: string;
  sizeBytes: number;
  /** Versión anterior descifrada localmente en el navegador. */
  oldCode: string;
  /** Versión actual descifrada localmente en el navegador. */
  newCode: string;
  /** Blob simulado para descarga cruda cifrada. */
  encryptedBlobName: string;
}

export interface TreeNode {
  name: string;
  fullPath: string;
  type: 'folder' | 'file';
  children: TreeNode[];
  file?: DotfileEntry;
}

export type DiffLineType = 'unchanged' | 'added' | 'removed';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}
