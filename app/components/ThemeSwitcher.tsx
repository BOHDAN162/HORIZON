import React from 'react';
import { useTheme } from '@/lib/useTheme';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Переключить тему"
      tabIndex={0}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      data-ui-layer="true"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};
