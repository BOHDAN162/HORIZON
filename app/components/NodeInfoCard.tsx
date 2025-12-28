import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchYoutubeForInterests, YoutubeItem } from '@/lib/api';
import { ViewportState } from '@/lib/useZoomPan';

type Props = {
  node: { id: string; label: string; x: number; y: number };
  view: ViewportState;
  onClose: () => void;
};

const CARD_WIDTH = 320;
const CARD_HEIGHT = 260;

export const NodeInfoCard: React.FC<Props> = ({ node, view, onClose }) => {
  const [items, setItems] = useState<YoutubeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement | null>(null);

  const position = useMemo(() => {
    const baseX = node.x * view.scale + view.offsetX;
    const baseY = node.y * view.scale + view.offsetY;
    const margin = 16;

    let left = baseX + 32;
    let top = baseY - CARD_HEIGHT / 2;
    if (typeof window !== 'undefined') {
      if (left + CARD_WIDTH > window.innerWidth - margin) {
        left = baseX - CARD_WIDTH - 32;
      }
      if (left < margin) left = margin;
      if (top < margin) top = margin;
      if (top + CARD_HEIGHT > window.innerHeight - margin) {
        top = window.innerHeight - CARD_HEIGHT - margin;
      }
    }
    return { left, top };
  }, [node.x, node.y, view.offsetX, view.offsetY, view.scale]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchYoutubeForInterests([node.label], 6);
      setItems(data);
    } catch {
      setError('Ошибка загрузки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [node.id, node.label]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={cardRef}
      className="pointer-events-auto absolute w-[320px] rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
      style={{ left: position.left, top: position.top }}
      data-ui-layer="true"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{node.label}</p>
          <p className="text-xs text-[var(--text-secondary)]">Подборка контента</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--hover-color)]"
          aria-label="Закрыть карточку"
        >
          ✕
        </button>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-gradient)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(96,123,255,0.35)] transition hover:brightness-110"
        >
          {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : null}
          Подобрать контент
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {error ? <p className="text-sm text-[#f2939a]">{error}</p> : null}
        {loading ? <p className="text-sm text-[var(--text-secondary)]">Загружаем подборку...</p> : null}
        {!loading && !error && !items.length ? <p className="text-sm text-[var(--text-secondary)]">Нет рекомендаций</p> : null}
        {!loading && !error
          ? items.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[var(--panel-border)] bg-[var(--surface)] px-3 py-2 transition hover:border-[var(--accent)] hover:bg-[var(--hover-color)]"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{item.channelTitle}</p>
              </a>
            ))
          : null}
      </div>
    </div>
  );
};
