import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'auto', label: 'Auto', icon: Monitor },
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div
      className="inline-flex items-center p-1 rounded-xl bg-white/[0.06] dark:bg-black/40 border border-white/[0.12] dark:border-white/[0.09] shadow-inner"
      role="group"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.mode;

        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={`Switch to ${opt.label} theme${opt.mode === 'auto' ? ` (currently ${resolvedTheme})` : ''}`}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none min-h-[36px] sm:min-h-0 ${
              isActive
                ? 'bg-yellow-400 text-slate-950 shadow-md font-extrabold scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="text-[11px] uppercase tracking-wider">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
