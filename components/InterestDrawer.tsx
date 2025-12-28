import React from 'react';

interface InterestDrawerProps {
  open: boolean;
  loading: boolean;
  suggestions: string[];
  error?: string;
  onClose: () => void;
  onRefresh: () => void;
  onAdd: (interest: string) => void;
}

const SkeletonItem = () => (
  <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
    <div className="h-3.5 w-28 rounded-full bg-[rgba(255,255,255,0.08)]" />
    <div className="h-8 w-8 rounded-full bg-[rgba(255,255,255,0.08)]" />
  </div>
);

export const InterestDrawer: React.FC<InterestDrawerProps> = ({
  open,
  loading,
  suggestions,
  error,
  onClose,
  onRefresh,
  onAdd,
}) => {
  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-[rgba(4,8,18,0.45)] backdrop-blur-[2px] transition ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[84vw] max-w-[380px] transform-gpu flex-col overflow-hidden border-r border-[rgba(255,255,255,0.06)] bg-[rgba(10,16,28,0.9)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(255,255,255,0.05)] px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(233,238,247,0.65)]">ИИ советует</p>
            <h3 className="text-lg font-semibold text-white">Новые интересы</h3>
            <p className="text-sm text-[rgba(233,238,247,0.7)]">Подобрано под вашу карту</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-xl border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-semibold text-textPrimary transition hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Обновить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full border border-[rgba(255,255,255,0.08)] text-sm font-semibold text-textSecondary transition hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, idx) => (
                <SkeletonItem key={idx} />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl bg-[rgba(255,128,149,0.08)] px-3 py-2.5 text-sm font-semibold text-[#ffc5d1]">{error}</div>
          ) : null}

          {!loading && !error && !suggestions.length ? (
            <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] px-3 py-2.5 text-sm text-[rgba(233,238,247,0.75)]">
              Добавьте пару интересов, чтобы получить точные рекомендации.
            </div>
          ) : null}

          {!loading && suggestions.length ? (
            <div className="space-y-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onAdd(suggestion)}
                  className="group flex w-full items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3.5 py-3 text-left transition hover:-translate-y-[1px] hover:border-[rgba(111,135,255,0.4)] hover:bg-[rgba(111,135,255,0.08)]"
                >
                  <span className="text-[15px] font-semibold text-white group-hover:text-white">{suggestion}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(111,135,255,0.12)] text-lg font-semibold text-white shadow-[0_10px_25px_rgba(111,135,255,0.25)] transition group-hover:bg-[rgba(111,135,255,0.24)]">
                    +
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
