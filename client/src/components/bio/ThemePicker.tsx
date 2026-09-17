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
  textColor: string;
  buttonBg: string;
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
  }
];

export const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {themes.map((theme) => {
        const isSelected = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={`flex flex-col p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
              isSelected
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-card'
                : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
            }`}
          >
            {/* Visual mini-mockup inside theme card */}
            <div
              className={`h-16 w-full rounded-lg border p-2 flex flex-col items-center justify-center space-y-1.5 mb-2.5 ${theme.previewBg}`}
            >
              <div className="h-3.5 w-3.5 rounded-full bg-zinc-400/40" />
              <div className={`h-2.5 w-3/4 rounded border ${theme.buttonBg}`} />
            </div>

            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-foreground">{theme.name}</span>
              {isSelected && (
                <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
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
