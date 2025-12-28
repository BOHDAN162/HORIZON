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
      className="flex items-center justify-center rounded-full p-2 text-[var(--text-primary)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      data-ui-layer="true"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};
