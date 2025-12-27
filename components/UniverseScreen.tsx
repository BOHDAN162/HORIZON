'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AddInterestModal } from './AddInterestModal';
import { ContentDrawer, RecommendationItem } from './ContentDrawer';
import { UniverseCanvas, UniverseEdge, UniverseNode, UniverseView } from './UniverseCanvas';

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
  const [edges, setEdges] = useState<UniverseEdge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const requestAbortRef = useRef<AbortController | null>(null);

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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const buildClientFallbackEdges = (interests: string[]) => {
    const unique = Array.from(new Set(interests));
    const sorted = [...unique].sort((a, b) => a.localeCompare(b, 'ru'));
    const maxEdgesPerNode = 2;
    const degrees = new Map<string, number>();
    const addDegree = (key: string) => degrees.set(key, (degrees.get(key) ?? 0) + 1);

    const edgesDraft: Array<{ source: string; target: string }> = [];
    const addEdge = (source: string, target: string) => {
      if (source === target) return;
      const key = [source, target].sort().join('||');
      if (edgesDraft.find((e) => [e.source, e.target].sort().join('||') === key)) return;
      if ((degrees.get(source) ?? 0) >= maxEdgesPerNode || (degrees.get(target) ?? 0) >= maxEdgesPerNode) return;
      edgesDraft.push({ source, target });
      addDegree(source);
      addDegree(target);
    };

    for (let i = 0; i < sorted.length - 1; i += 1) {
      addEdge(sorted[i], sorted[i + 1]);
    }

    if (edgesDraft.length < 2 && sorted.length >= 3) {
      addEdge(sorted[0], sorted[2]);
    }

    const mapByLabel = new Map(nodes.map((node) => [node.label, node.id]));
    return edgesDraft
      .map((edge) => {
        const sourceId = mapByLabel.get(edge.source);
        const targetId = mapByLabel.get(edge.target);
        if (!sourceId || !targetId) return null;
        const id = [sourceId, targetId].sort().join('-');
        return { id, sourceId, targetId };
      })
      .filter(Boolean) as UniverseEdge[];
  };

  useEffect(() => {
    if (nodes.length < 2) {
      setEdges([]);
      return;
    }

    const interests = collectInterests();
    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
    }
    const controller = new AbortController();
    requestAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/graph/edges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interests, maxEdgesPerNode: 3 }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('edge_request_failed');
        }

        const data: { edges?: Array<{ source: string; target: string }> } = await response.json();
        const pairs = data.edges ?? [];
        const mapByLabel = new Map(nodes.map((node) => [node.label, node.id]));
        const deduped = new Set<string>();
        const mapped: UniverseEdge[] = [];

        for (const pair of pairs) {
          const sourceId = mapByLabel.get(pair.source);
          const targetId = mapByLabel.get(pair.target);
          if (!sourceId || !targetId || sourceId === targetId) continue;
          const key = [sourceId, targetId].sort().join('-');
          if (deduped.has(key)) continue;
          deduped.add(key);
          mapped.push({ id: key, sourceId, targetId });
        }

        if (!mapped.length) {
          setEdges(buildClientFallbackEdges(interests));
        } else {
          setEdges(mapped);
        }
      } catch {
        setEdges(buildClientFallbackEdges(interests));
      }
    }, 550);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

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
    <div className="fixed inset-0 isolate overflow-hidden bg-[radial-gradient(60%_60%_at_20%_80%,rgba(113,66,192,0.25),transparent),radial-gradient(45%_45%_at_85%_20%,rgba(58,112,196,0.26),transparent),linear-gradient(180deg,#0d172b_0%,#0c1528_40%,#0c1628_100%)]">
      <div className="cosmic-fog pointer-events-none absolute inset-0" aria-hidden />

      <div className="absolute inset-0">
        <UniverseCanvas nodes={nodes} edges={edges} view={view} setView={setView} onMoveNode={moveNode} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        {toast ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-full max-w-xl -translate-x-1/2 px-4">
            <div className="pointer-events-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(18,26,42,0.95)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              {toast}
            </div>
          </div>
        ) : null}

        <header className="pointer-events-auto mx-auto mt-4 w-[calc(100%-24px)] max-w-[1200px] rounded-3xl border border-[rgba(255,255,255,0.05)] bg-[rgba(11,18,31,0.78)] px-4 py-3 shadow-[0_12px_50px_rgba(0,0,0,0.35)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[rgba(102,130,255,0.16)] px-3 py-2 text-sm font-semibold text-white">HORIZON</span>
              <p className="hidden text-sm text-textSecondary sm:block">Твоя метавселенная интересов</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
          </div>
        </header>

        <div className="pointer-events-none relative flex-1">
          <div className="pointer-events-none absolute bottom-6 right-6 z-20 rounded-2xl bg-[rgba(10,16,28,0.78)] px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-[rgba(233,238,247,0.9)] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur sm:bottom-8 sm:right-8">
            <p>Тяни — перемещение · Колесо — масштаб · Перетащи узел — поменяй карту</p>
          </div>
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
