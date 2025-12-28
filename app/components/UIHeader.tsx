import React from 'react';
import { PersonalityHeader } from './PersonalityHeader';
import { ThemeSwitcher } from './ThemeSwitcher';

type Props = {
  personality: { name: string; description: string };
  onAdd: () => void;
  onToggleDrawer: () => void;
};

export const UIHeader: React.FC<Props> = ({ personality, onAdd, onToggleDrawer }) => (
  <header
    className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex justify-between px-4 py-3 sm:px-6 sm:py-4"
    data-ui-layer="true"
  >
    <div className="pointer-events-auto flex items-center gap-3">
      <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 pr-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        <span className="text-lg">🪐</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">HORIZON</span>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-9 items-center gap-2 rounded-full bg-[var(--accent-gradient)] px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(96,123,255,0.4)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <span className="text-base leading-none">＋</span>
        Добавить
      </button>
      <button
        type="button"
        aria-label="Рекомендации"
        onClick={onToggleDrawer}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-lg text-[var(--text-primary)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        ☰
      </button>
    </div>
    <div className="pointer-events-auto flex flex-1 flex-col items-center">
      <PersonalityHeader name={personality.name} description={personality.description} />
    </div>
    <div className="pointer-events-auto flex items-center gap-3">
      <ThemeSwitcher />
    </div>
  </header>
);
