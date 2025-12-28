'use client';

import React, { useMemo, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  recommendations: string[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onAdd: (label: string) => void;
};

export const Drawer: React.FC<Props> = ({ open, onClose, recommendations, loading, error, onRefresh, onAdd }) => {
  const [custom, setCustom] = useState('');

  const content = useMemo(() => {
    if (loading) return <p className="text-sm text-[var(--text-secondary)]">ИИ подбирает интересы...</p>;
    if (error) return <p className="text-sm text-[#f2939a]">{error}</p>;
    if (!recommendations.length) return <p className="text-sm text-[var(--text-secondary)]">Нет рекомендаций</p>;
    return (
      <ul className="space-y-2">
        {recommendations.map((item) => (
          <li key={item} className="flex items-center justify-between rounded-lg border border-[var(--panel-border)] bg-[var(--surface)] px-3 py-2">
            <span className="text-sm text-[var(--text-primary)]">{item}</span>
            <button
              type="button"
              className="rounded-md bg-[var(--accent-gradient)] px-2 py-1 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
              onClick={() => onAdd(item)}
            >
              + Добавить
            </button>
          </li>
        ))}
      </ul>
    );
  }, [recommendations, loading, error, onAdd]);

  const handleSubmit = () => {
    const value = custom.trim();
    if (!value) return;
    onAdd(value);
    setCustom('');
  };

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 transition ${open ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!open}
      data-ui-layer="true"
    >
      <div
        className={`absolute inset-0 bg-[var(--drawer-backdrop)] backdrop-blur-sm transition ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`pointer-events-auto absolute left-0 top-0 h-full w-[320px] max-w-[82vw] translate-x-${open ? '0' : '[-105%]'} transform bg-[var(--panel-bg)] px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Добавить интерес</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)]"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Введите свой интерес"
              className="h-10 flex-1 rounded-lg border border-[var(--panel-border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-[var(--accent-gradient)] px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:brightness-110"
            >
              Добавить
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>ИИ рекомендует</span>
            <button type="button" onClick={onRefresh} className="text-[var(--text-primary)] underline decoration-dashed">Обновить</button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-1">{content}</div>
        </div>
      </aside>
    </div>
  );
};
