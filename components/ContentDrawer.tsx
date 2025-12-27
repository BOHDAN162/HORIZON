'use client';

import React from 'react';

export interface RecommendationItem {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
  publishedAt: string;
}

interface ContentDrawerProps {
  open: boolean;
  loading: boolean;
  items: RecommendationItem[];
  queries?: string[];
  error?: string;
  onRefresh: () => void;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.03)] px-3.5 py-3">
    <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,255,255,0.08)]" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-3/4 rounded-full bg-[rgba(255,255,255,0.08)]" />
      <div className="h-3 w-1/3 rounded-full bg-[rgba(255,255,255,0.06)]" />
    </div>
  </div>
);

export const ContentDrawer: React.FC<ContentDrawerProps> = ({
  open,
  loading,
  items,
  queries,
  error,
  onRefresh,
  onClose,
  onSelect,
}) => {
  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-30 sm:inset-y-6 sm:right-6 sm:left-auto sm:w-[380px] ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(10,16,28,0.92)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition duration-300 ${
          open ? 'translate-y-0 sm:translate-x-0 opacity-100' : 'translate-y-[120%] sm:translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(255,255,255,0.05)] px-4 py-3.5">
          <div>
            <h3 className="text-base font-semibold text-white">Подборка контента</h3>
            {queries && queries.length ? (
              <p className="mt-1 text-xs text-[rgba(233,238,247,0.65)]">Подобрано по запросам: {queries.slice(0, 3).join(' • ')}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-xl border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs font-semibold text-textPrimary transition hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Обновить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[rgba(255,255,255,0.06)] px-2.5 py-1 text-xs font-semibold text-textSecondary transition hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.06)]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-160px)]">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonRow key={idx} />
              ))}
            </div>
          ) : null}

          {!loading && error ? <p className="rounded-xl bg-[rgba(255,128,149,0.08)] px-3.5 py-3 text-sm font-semibold text-[#ffc5d1]">{error}</p> : null}

          {!loading && !error && !items.length ? (
            <p className="rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] px-3.5 py-3 text-sm font-medium text-[rgba(233,238,247,0.7)]">
              Ничего не найдено, попробуйте другие интересы
            </p>
          ) : null}

          {!loading && !error && items.length ? (
            <div className="space-y-1.5">
              {items.map((item) => (
                <button
                  key={item.videoId}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className="group flex w-full flex-col rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3.5 py-3 text-left transition duration-150 hover:-translate-y-[1px] hover:border-[rgba(111,135,255,0.35)] hover:bg-[rgba(111,135,255,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c9dff]/60"
                >
                  <p className="text-[15px] font-semibold leading-snug text-white group-hover:text-white">{item.title}</p>
                  <p className="text-xs font-medium text-[rgba(233,238,247,0.7)]">{item.channelTitle}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
