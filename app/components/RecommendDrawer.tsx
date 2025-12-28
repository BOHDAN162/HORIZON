import React from 'react';
import { NodeVisual } from '@/lib/nodeColors';

type Item = {
  label: string;
};

type Props = {
  open: boolean;
  loading: boolean;
  error: string;
  items: Item[];
  onClose: () => void;
  onRefresh: () => void;
  onAdd: (label: string) => void;
  getColorForLabel?: (label: string) => NodeVisual;
};

export const RecommendDrawer: React.FC<Props> = ({ open, loading, error, items, onClose, onRefresh, onAdd, getColorForLabel }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[var(--drawer-backdrop)] backdrop-blur-md transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        data-ui-layer="true"
      />
      <aside
        className={`fixed left-0 right-0 bottom-0 z-40 flex h-[65vh] w-full flex-col border-t border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_-12px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 sm:bottom-0 sm:left-0 sm:right-auto sm:top-0 sm:h-full sm:max-w-[340px] sm:border-t-0 sm:border-r sm:shadow-[0_20px_80px_rgba(0,0,0,0.4)] ${
          open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:-translate-x-full'
        }`}
        data-ui-layer="true"
      >
        <div className="flex items-center justify-between px-4 py-4 sm:py-5">
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">Рекомендации</p>
            <p className="text-sm text-[var(--text-secondary)]">На основе ваших интересов</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--surface)] text-[var(--text-primary)] transition hover:bg-[var(--hover-color)]"
              aria-label="Обновить"
            >
              ↻
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--surface)] text-[var(--text-primary)] transition hover:bg-[var(--hover-color)]"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] px-4 py-3 text-[var(--text-secondary)]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              Загружаем...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-[#f2939a]/50 bg-[#f2939a]/10 px-4 py-3 text-sm text-[#f2939a]">
              {error}
              <button
                type="button"
                onClick={onRefresh}
                className="ml-2 text-[var(--text-primary)] underline decoration-[var(--accent)] decoration-2 underline-offset-2"
              >
                Повторить
              </button>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const visual = getColorForLabel?.(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onAdd(item.label)}
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] px-3.5 py-3 text-left transition hover:border-[var(--accent)] hover:bg-[var(--hover-color)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: visual ? visual.gradient : 'var(--accent)',
                      }}
                    />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</span>
                  </div>
                  <span className="text-lg text-[var(--text-primary)]">＋</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
