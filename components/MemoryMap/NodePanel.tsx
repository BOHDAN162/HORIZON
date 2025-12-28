'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { InterestNode } from './types';
import { fetchYoutubeForInterests } from '@/lib/api';

type Props = {
  node: InterestNode;
  onClose: () => void;
  onDelete: (id: string) => void;
};

type YoutubeItem = {
  title: string;
  url: string;
  snippet?: string;
};

export const NodePanel: React.FC<Props> = ({ node, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<YoutubeItem[]>([]);

  const position = useMemo(() => {
    return { top: 80, right: 24 };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchYoutubeForInterests([node.label], 12);
      setItems(result.map((item) => ({ title: item.title, url: item.url, snippet: item.channelTitle })));
    } catch {
      setError('Не удалось подобрать контент, попробуй ещё раз');
    } finally {
      setLoading(false);
    }
  }, [node.label]);

  useEffect(() => {
    load();
  }, [node.id, load]);

  return (
    <div
      className="pointer-events-auto fixed z-50 w-[360px] max-w-[94vw] rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={{ top: position.top, right: position.right }}
      data-ui-layer="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{node.label}</p>
          <p className="text-xs text-[var(--text-secondary)]">Подборка YouTube</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#f2939a] transition hover:bg-[#f2939a]/10"
          >
            Удалить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)]"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-gradient)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(96,123,255,0.35)] transition hover:brightness-110"
        >
          {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : null}
          Подобрать контент
        </button>
        {error ? <p className="text-xs text-[#f2939a]">{error}</p> : null}
      </div>

      <div className="mt-3 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {!loading && !error && !items.length ? <p className="text-sm text-[var(--text-secondary)]">Нет рекомендаций</p> : null}
        {loading ? <p className="text-sm text-[var(--text-secondary)]">Загружаем...</p> : null}
        {!loading && !error
          ? items.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => window.open(item.url, '_blank')}
                className="flex w-full flex-col items-start rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] px-3 py-2 text-left transition hover:border-[var(--accent)] hover:bg-[var(--hover-color)]"
              >
                <span className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{item.title}</span>
                {item.snippet ? <span className="text-xs text-[var(--text-secondary)] line-clamp-1">{item.snippet}</span> : null}
              </button>
            ))
          : null}
      </div>
    </div>
  );
};
