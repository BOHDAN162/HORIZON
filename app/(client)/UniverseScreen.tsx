'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AddInterestModal } from '@/app/components/AddInterestModal';
import { RecommendDrawer } from '@/app/components/RecommendDrawer';
import { UIHeader } from '@/app/components/UIHeader';
import { UniverseCanvas, UniverseNode } from '@/app/components/UniverseCanvas';
import { NodeInfoCard } from '@/app/components/NodeInfoCard';
import { fetchEdges, fetchInterestRecommendations, fetchYoutubeForInterests } from '@/lib/api';
import { getPersonality } from '@/lib/profiles';
import { ThemeProvider, useTheme } from '@/lib/useTheme';
import { useZoomPan } from '@/lib/useZoomPan';
import type { Edge } from '@/app/components/EdgeLayer';

const INITIAL_NODES: UniverseNode[] = [
  { id: 'tech', label: 'Технологии', x: -120, y: -60, color: '' },
  { id: 'design', label: 'Дизайн', x: 120, y: -40, color: '' },
  { id: 'philosophy', label: 'Философия', x: -60, y: 120, color: '' },
  { id: 'business', label: 'Бизнес', x: 180, y: 140, color: '' },
  { id: 'ai', label: 'AI', x: 20, y: -160, color: '' },
];

const palette = [
  'linear-gradient(135deg,#7c9dff,#5ec2ff)',
  'linear-gradient(135deg,#9f6bff,#6fd1ff)',
  'linear-gradient(135deg,#6b9fff,#c86bff)',
  'linear-gradient(135deg,#6fe0ff,#6f87ff)',
  'linear-gradient(135deg,#8fb3ff,#9f6bff)',
  'linear-gradient(135deg,#ffb86c,#ff9b9b)',
  'linear-gradient(135deg,#6ff0c4,#5fb3ff)',
];

const buildColor = (index: number) => palette[index % palette.length];

const clampEdges = (edges: Array<{ source: string; target: string }>, nodes: UniverseNode[]) => {
  const mapByLabel = new Map(nodes.map((node) => [node.label, node.id]));
  const deduped = new Set<string>();
  const result: Edge[] = [];
  edges.forEach((edge) => {
    const sourceId = mapByLabel.get(edge.source);
    const targetId = mapByLabel.get(edge.target);
    if (!sourceId || !targetId || sourceId === targetId) return;
    const key = [sourceId, targetId].sort().join('||');
    if (deduped.has(key)) return;
    deduped.add(key);
    result.push({ id: key, sourceId, targetId });
  });
  return result;
};

const buildFallbackEdges = (nodes: UniverseNode[]): Edge[] => {
  const labels = nodes.map((node) => node.label).sort((a, b) => a.localeCompare(b, 'ru'));
  const edges: Array<{ source: string; target: string }> = [];
  for (let i = 0; i < labels.length - 1; i += 1) {
    edges.push({ source: labels[i], target: labels[i + 1] });
  }
  return clampEdges(edges, nodes);
};

const InnerUniverse: React.FC = () => {
  const [nodes, setNodes] = useState<UniverseNode[]>(() => INITIAL_NODES.map((node, index) => ({ ...node, color: buildColor(index) })));
  const [edges, setEdges] = useState<Edge[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<{ label: string }[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contentItems, setContentItems] = useState<{ title: string; url: string }[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [toast, setToast] = useState('');
  const { view, setView, containerRef, handlePointerDown } = useZoomPan();
  const personality = useMemo(() => getPersonality(nodes.map((node) => node.label)), [nodes]);
  const activeNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEdges(nodes.map((n) => n.label))
        .then((apiEdges) => setEdges(apiEdges.length ? clampEdges(apiEdges, nodes) : buildFallbackEdges(nodes)))
        .catch(() => setEdges(buildFallbackEdges(nodes)));
    }, 200);
    return () => clearTimeout(timer);
  }, [nodes]);

  const handleAddInterest = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return { success: false, error: 'Введите интерес' };
    if (nodes.some((node) => node.label.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: 'Уже есть в списке' };
    }
    const worldX = (window.innerWidth / 2 - view.offsetX) / view.scale;
    const worldY = (window.innerHeight / 2 - view.offsetY) / view.scale;
    setNodes((prev) => [...prev, { id: crypto.randomUUID(), label: trimmed, x: worldX, y: worldY, color: buildColor(prev.length) }]);
    setToast('Интерес добавлен');
    return { success: true as const };
  };

  const refreshRecommendations = useCallback(async () => {
    setRecommendLoading(true);
    setRecommendError('');
    try {
      const interestList = nodes.map((node) => node.label);
      if (!interestList.length) {
        setRecommendError('Сначала добавьте интересы');
        return;
      }
      const recs = await fetchInterestRecommendations(interestList);
      setRecommendations(recs.slice(0, 7).map((label) => ({ label })));
    } catch {
      setRecommendError('Ошибка загрузки. Попробуйте позже.');
      setRecommendations([]);
    } finally {
      setRecommendLoading(false);
    }
  }, [nodes]);

  const handleAddFromRecommendation = (label: string) => {
    const result = handleAddInterest(label);
    if (result.success) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (drawerOpen) {
      refreshRecommendations();
    }
  }, [drawerOpen, refreshRecommendations]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleMoveNode = (id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x: position.x, y: position.y } : node)));
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
  };

  const handleFetchContent = async () => {
    setContentLoading(true);
    setContentError('');
    try {
      const interestList = nodes.map((node) => node.label);
      if (!interestList.length) {
        setContentError('Добавьте интересы');
        return;
      }
      const items = await fetchYoutubeForInterests(interestList, 8);
      setContentItems(items.map((item) => ({ title: item.title, url: item.url })));
    } catch {
      setContentError('Ошибка загрузки. Попробуйте позже.');
      setContentItems([]);
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-color)]">
      <div className="starry-layer pointer-events-none fixed inset-0" aria-hidden />

      <div
        className="world-layer fixed inset-0"
        ref={containerRef}
        onPointerDown={handlePointerDown}
      >
        <UniverseCanvas
          nodes={nodes}
          edges={edges}
          view={view}
          onMoveNode={handleMoveNode}
          onNodeClick={handleNodeClick}
          containerRef={containerRef}
          onBackgroundPointerDown={handlePointerDown}
        />
      </div>

      <div className="overlay-layer pointer-events-none fixed inset-0">
        {activeNode ? <NodeInfoCard node={activeNode} view={view} onClose={() => setSelectedNodeId(null)} /> : null}
        <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col items-end gap-2" data-ui-layer="true">
          <button
            type="button"
            onClick={handleFetchContent}
          className="rounded-full bg-[var(--accent-gradient)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(96,123,255,0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
            {contentLoading ? 'Подбираем…' : 'Подобрать контент'}
          </button>
          {contentError ? <p className="rounded-xl bg-[#f2939a]/20 px-3 py-2 text-xs text-[#ffd9de]">{contentError}</p> : null}
          {contentItems.length ? (
            <div className="w-full max-w-sm rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
              <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Подборка видео</p>
              <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                {contentItems.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[var(--panel-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--hover-color)]"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <UIHeader personality={personality} onAdd={() => setAddModalOpen(true)} onToggleDrawer={() => setDrawerOpen((prev) => !prev)} />

      <RecommendDrawer
        open={drawerOpen}
        loading={recommendLoading}
        error={recommendError}
        items={recommendations}
        onClose={() => setDrawerOpen(false)}
        onRefresh={refreshRecommendations}
        onAdd={handleAddFromRecommendation}
      />

      <AddInterestModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddInterest} />

      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-16 z-[60] -translate-x-1/2" data-ui-layer="true">
          <div className="pointer-events-auto rounded-full bg-[var(--panel-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            {toast}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-4 flex justify-center px-4" data-ui-layer="true">
        <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[0_12px_35px_rgba(0,0,0,0.28)]">
          Колесо — масштаб · Тяни фон — панорама · Клик по узлу — карточка
        </div>
      </div>
    </div>
  );
};

export const UniverseScreen: React.FC = () => (
  <ThemeProvider>
    <InnerUniverse />
  </ThemeProvider>
);
