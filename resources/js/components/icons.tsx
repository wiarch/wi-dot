/** Iconos SVG inline — sin dependencias extra. */

type IconProps = { className?: string };

export function ChevronRight({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileText({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 2.5h5.5L12 5v8.5a1 1 0 01-1 1H4a1 1 0 01-1-1V3.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M9 2.5V5h3" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

export function Folder({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5A1 1 0 013.5 3.5H6l1.2 1.2a1 1 0 00.7.3h4.6a1 1 0 011 1V12a1 1 0 01-1 1H3.5a1 1 0 01-1-1V4.5z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function FolderOpen({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5h11v5a1 1 0 01-1 1H3.5a1 1 0 01-1-1v-5z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M2.5 6.5l1.6-3.2A1 1 0 015 2.5h3l1.2 1.2h4.3a1 1 0 011 1v2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function Download({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.5v7m0 0l3-3m-3 3L5 6.5M3.5 12.5h9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Menu({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function GitCompare({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="4.5" r="1.75" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="11.5" cy="11.5" r="1.75" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6.2 5.8l3.6 3.6M9.8 5.8L6.2 9.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function Shield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l5 2v4.5c0 3.2-2.1 5.5-5 6.5-2.9-1-5-3.3-5-6.5V3.5l5-2z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}
