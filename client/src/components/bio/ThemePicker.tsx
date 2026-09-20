import React from 'react';
import { BioTheme } from '@/types';
import { Check } from 'lucide-react';

interface ThemePickerProps {
  currentTheme: BioTheme;
  onThemeChange: (theme: BioTheme) => void;
}

const themes: Array<{
  id: BioTheme;
  name: string;
  desc: string;
  previewBg: string;
  previewBgStyle?: React.CSSProperties;
  textColor: string;
  buttonBg: string;
  buttonStyle?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
}> = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    desc: 'Crisp white, high contrast, clean typography',
    previewBg: 'bg-white border-zinc-200',
    textColor: 'text-zinc-900',
    buttonBg: 'bg-zinc-100 border-zinc-200 text-zinc-900'
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    desc: 'Zinc and obsidian, subtle card borders',
    previewBg: 'bg-zinc-950 border-zinc-800',
    textColor: 'text-zinc-100',
    buttonBg: 'bg-zinc-900 border-zinc-700 text-zinc-100'
  },
  {
    id: 'gradient',
    name: 'Gradient',
    desc: 'Deep indigo mesh blend, modern tech aesthetic',
    previewBg: 'bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900 border-indigo-900/50',
    textColor: 'text-white',
    buttonBg: 'bg-indigo-950/60 border-indigo-500/30 text-white'
  },
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    desc: 'Deep midnight with atmospheric aurora lighting',
    previewBg: 'border-[#2A3545]',
    previewBgStyle: {
      background:
        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(32,80,90,0.55) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 90%, rgba(40,55,90,0.35) 0%, transparent 70%), #05070A'
    },
    textColor: 'text-[#F5F7FA]',
    buttonBg: 'border-[#2A3545] text-[#9CA6B5]',
    buttonStyle: { background: 'rgba(255,255,255,0.05)' },
    avatarStyle: { background: 'rgba(255,255,255,0.06)' }
  },
  {
    id: 'paper-studio',
    name: 'Paper Studio',
    desc: 'Warm editorial paper, elegant and restrained',
    previewBg: 'border-[#DDD8CE]',
    previewBgStyle: { background: '#F5F1E8' },
    textColor: 'text-[#1E1D1A]',
    buttonBg: 'border-[#DDD8CE] text-[#1E1D1A]',
    buttonStyle: { background: '#FFFDF8' },
    avatarStyle: { background: '#DDD8CE' }
  }
];

export const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {themes.map((theme) => {
        const isSelected = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all duration-150 relative overflow-hidden cursor-pointer ${
              isSelected
                ? 'border-zinc-300 ring-1 ring-zinc-400/40 bg-card shadow-sm'
                : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
            }`}
          >
            {/* Visual mini-mockup inside theme card */}
            <div
              className={`h-16 w-full rounded-lg border p-2 flex flex-col items-center justify-center space-y-1.5 mb-2.5 ${theme.previewBg}`}
              style={theme.previewBgStyle}
            >
              <div
                className="h-3.5 w-3.5 rounded-full bg-zinc-400/40"
                style={theme.avatarStyle}
              />
              <div
                className={`h-2.5 w-3/4 rounded border ${theme.buttonBg}`}
                style={theme.buttonStyle}
              />
            </div>

            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-foreground">{theme.name}</span>
              {isSelected && (
                <div className="h-4 w-4 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{theme.desc}</p>
          </button>
        );
      })}
    </div>
  );
};
