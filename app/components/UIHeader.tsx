import React from 'react';
import { PersonalityHeader } from './PersonalityHeader';
import { ThemeSwitcher } from './ThemeSwitcher';

type Props = {
  personalityName: string;
  onAdd: () => void;
  onToggleDrawer: () => void;
  onBack?: () => void;
};

export const UIHeader: React.FC<Props> = ({ personalityName, onAdd, onToggleDrawer, onBack }) => (
  <header
    className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-6"
    data-ui-layer="true"
  >
    <div className="pointer-events-auto flex items-center gap-3 sm:gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-bg)] text-lg text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          ←
        </button>
      ) : null}
      <div className="flex h-10 items-center gap-2 rounded-full bg-[var(--panel-bg)] px-3 pr-4 text-sm font-semibold text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <span className="text-base">🪐</span>
        HORIZON
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex h-8 items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 text-xs font-semibold text-[var(--chip-text)] shadow-[0_12px_30px_rgba(96,123,255,0.32)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <span className="text-base leading-none">＋</span>
        Добавить интерес
      </button>
      <button
        type="button"
        aria-label="Рекомендации"
        onClick={onToggleDrawer}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--panel-bg)] text-lg text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        ☰
      </button>
    </div>
    <div className="pointer-events-auto flex flex-1 justify-center">
      <PersonalityHeader name={personalityName} />
    </div>
    <div className="pointer-events-auto flex items-center justify-end gap-3">
      <ThemeSwitcher />
    </div>
  </header>
);
