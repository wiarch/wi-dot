import type { DotfileEntry } from '@/types/dotfile';

export const MOCK_DOTFILES: DotfileEntry[] = [
  {
    id: 'df-1',
    path: '~/.config/hypr/hyprland.conf',
    filename: 'hyprland.conf',
    environment: 'Desktop-Hyprland',
    backedUpAt: '2026-06-08T22:14:00Z',
    sizeBytes: 2840,
    encryptedBlobName: 'hyprland.conf.enc.json',
    oldCode: `# Hyprland config
monitor=DP-1,2560x1440@144,0x0,1
monitor=HDMI-A-1,1920x1080@60,2560x0,1

input {
    kb_layout = us
    follow_mouse = 1
}

general {
    gaps_in = 5
    gaps_out = 10
    border_size = 2
}

bind = SUPER, Return, exec, kitty
bind = SUPER, Q, killactive,
`,
    newCode: `# Hyprland config
monitor=DP-1,2560x1440@144,0x0,1
monitor=HDMI-A-1,1920x1080@60,2560x0,1

input {
    kb_layout = us,es
    follow_mouse = 1
    sensitivity = 0.0
}

general {
    gaps_in = 5
    gaps_out = 15
    border_size = 2
    col.active_border = rgba(33ccffee) rgba(00ff99ee) 45deg
}

bind = SUPER, Return, exec, kitty
bind = SUPER, Q, killactive,
bind = SUPER, E, exec, thunar
`,
  },
  {
    id: 'df-2',
    path: '~/.config/hypr/hypridle.conf',
    filename: 'hypridle.conf',
    environment: 'Desktop-Hyprland',
    backedUpAt: '2026-06-07T18:02:00Z',
    sizeBytes: 612,
    encryptedBlobName: 'hypridle.conf.enc.json',
    oldCode: `general {
    lock_cmd = pidof hyprlock || hyprlock
    before_sleep_cmd = loginctl lock-session
}

listener {
    timeout = 300
    on-timeout = loginctl lock-session
}
`,
    newCode: `general {
    lock_cmd = pidof hyprlock || hyprlock
    before_sleep_cmd = loginctl lock-session
    after_sleep_cmd = hyprctl dispatch dpms on
}

listener {
    timeout = 300
    on-timeout = loginctl lock-session
}

listener {
    timeout = 600
    on-timeout = hyprctl dispatch dpms off
}
`,
  },
  {
    id: 'df-3',
    path: '~/.config/kitty/kitty.conf',
    filename: 'kitty.conf',
    environment: 'Desktop-Hyprland',
    backedUpAt: '2026-06-06T09:30:00Z',
    sizeBytes: 1480,
    encryptedBlobName: 'kitty.conf.enc.json',
    oldCode: `font_family      JetBrains Mono
font_size        11.0
background       #0f0f14
foreground       #e4e4e7
cursor           #a1a1aa
`,
    newCode: `font_family      JetBrains Mono
font_size        12.0
background       #09090b
foreground       #fafafa
cursor           #71717a
shell            /bin/bash
`,
  },
  {
    id: 'df-4',
    path: '~/.bashrc',
    filename: '.bashrc',
    environment: 'Laptop-Minimal',
    backedUpAt: '2026-06-05T14:20:00Z',
    sizeBytes: 920,
    encryptedBlobName: 'bashrc.enc.json',
    oldCode: `# ~/.bashrc
export EDITOR=nvim
export PATH="$HOME/.local/bin:$PATH"

alias ll='ls -la'
`,
    newCode: `# ~/.bashrc
export EDITOR=nvim
export PATH="$HOME/.local/bin:$PATH"
export WI_DOT_ENV=laptop

alias ll='ls -la'
alias gs='git status -sb'
`,
  },
  {
    id: 'df-5',
    path: '~/.config/starship.toml',
    filename: 'starship.toml',
    environment: 'Laptop-Minimal',
    backedUpAt: '2026-06-04T11:00:00Z',
    sizeBytes: 540,
    encryptedBlobName: 'starship.toml.enc.json',
    oldCode: `[character]
success_symbol = "[➜](bold green)"
error_symbol = "[➜](bold red)"
`,
    newCode: `[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"

[directory]
truncation_length = 4
`,
  },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
