'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AddInterestModal } from './AddInterestModal';
import { ContentDrawer, RecommendationItem } from './ContentDrawer';
import { UniverseCanvas, UniverseNode, UniverseView } from './UniverseCanvas';

interface UniverseScreenProps {
  onBack: () => void;
}

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export const UniverseScreen: React.FC<UniverseScreenProps> = ({ onBack }) => {
  const initialNodes = useMemo<UniverseNode[]>(
    () => [
      { id: 'tech', label: 'Технологии', x: -160, y: -80 },
      { id: 'design', label: 'Дизайн', x: 110, y: -30 },
      { id: 'philosophy', label: 'Философия', x: -60, y: 130 },
      { id: 'business', label: 'Бизнес', x: 180, y: 140 },
      { id: 'ai', label: 'AI', x: 10, y: -180 },
    ],
    []
  );

  const [nodes, setNodes] = useState<UniverseNode[]>(initialNodes);
  const [view, setView] = useState<UniverseView>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const handleAddInterest = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return { success: false, error: 'Введите интерес' };
    }
    const exists = nodes.some((node) => node.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      return { success: false, error: 'Уже добавлено' };
    }

    const randomShift = () => (Math.random() - 0.5) * 80;
    const worldX = -view.offsetX / view.scale + randomShift();
    const worldY = -view.offsetY / view.scale + randomShift();

    setNodes((prev) => [...prev, { id: createId(), label: trimmed, x: worldX, y: worldY }]);
    return { success: true as const };
  };

  const moveNode = (id: string, delta: { dx: number; dy: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x: node.x + delta.dx, y: node.y + delta.dy } : node)));
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const collectInterests = () => nodes.map((node) => node.label).filter(Boolean);

  const fetchRecommendations = async () => {
    if (isLoading) return;

    const interests = collectInterests();
    if (!interests.length) {
      setToast('Сначала добавьте интересы');
      return;
    }

    setIsLoading(true);
    setError('');
    setDrawerOpen(true);

    try {
      const response = await fetch('/api/recommend/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, limit: 15 }),
      });

      if (!response.ok) {
        throw new Error('request_failed');
      }

      const data: { queries?: string[]; items?: RecommendationItem[]; error?: string } = await response.json();
      if (data.error) {
        throw new Error('request_failed');
      }

      setRecommendations(data.items ?? []);
      setQueries(data.queries ?? []);
    } catch {
      setRecommendations([]);
      setQueries([]);
      setError('Не удалось подобрать контент. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVideo = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-6 pb-12 pt-6 lg:px-10">
      <div className="cosmic-fog pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex min-h-[80vh] flex-col gap-6 animate-screen-appear">
        {toast ? (
          <div className="pointer-events-none absolute left-1/2 top-2 z-30 w-full max-w-xl -translate-x-1/2 px-4">
            <div className="pointer-events-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(18,26,42,0.9)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              {toast}
            </div>
          </div>
        ) : null}

        <header className="flex items-center justify-between rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(11,18,31,0.75)] px-4 py-3 shadow-[0_12px_50px_rgba(0,0,0,0.35)] sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-[rgba(102,130,255,0.16)] px-3 py-2 text-sm font-semibold text-white">HORIZON</span>
            <p className="hidden text-sm text-textSecondary sm:block">Твоя метавселенная интересов</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-[#8a6bff] to-[#5f9cff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(115,133,255,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? 'Подбираем…' : 'Подобрать контент'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-[#6f87ff] to-[#9f6bff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(115,133,255,0.35)] transition hover:brightness-105"
            >
              Добавить интерес
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              Назад
            </button>
          </div>
        </header>

        <UniverseCanvas nodes={nodes} view={view} setView={setView} onMoveNode={moveNode} />

        <div
          className={`pointer-events-none absolute bottom-6 z-20 rounded-2xl bg-[rgba(10,16,28,0.75)] px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-[rgba(233,238,247,0.9)] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur ${
            drawerOpen ? 'left-6 right-auto' : 'right-6'
          }`}
        >
          <p>Тяни мышью — перемещение</p>
          <p>Колесо — масштаб</p>
          <p>Перетаскивай узлы — меняй карту</p>
        </div>
      </div>

      <ContentDrawer
        open={drawerOpen}
        loading={isLoading}
        items={recommendations}
        queries={queries}
        error={error}
        onRefresh={fetchRecommendations}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleOpenVideo}
      />

      <AddInterestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddInterest} />
    </div>
  );
};
