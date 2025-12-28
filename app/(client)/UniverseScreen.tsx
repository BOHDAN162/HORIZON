'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AddInterestModal } from '@/app/components/AddInterestModal';
import { RecommendDrawer } from '@/app/components/RecommendDrawer';
import { UIHeader } from '@/app/components/UIHeader';
import { UniverseCanvas, UniverseNode } from '@/app/components/UniverseCanvas';
import { NodeInfoCard } from '@/app/components/NodeInfoCard';
import { ContactCard } from '@/app/components/ContactCard';
import { fetchEdges, fetchInterestRecommendations } from '@/lib/api';
import { getPersonality } from '@/lib/profiles';
import { useTheme } from '@/lib/useTheme';
import { useZoomPan } from '@/lib/useZoomPan';
import type { Edge } from '@/app/components/EdgeLayer';
import { hashColorIndex, resolveNodeVisual } from '@/lib/nodeColors';

const INITIAL_NODES: UniverseNode[] = [
  { id: 'tech', label: 'Технологии', x: -120, y: -60, colorIndex: hashColorIndex('Технологии') },
  { id: 'design', label: 'Дизайн', x: 120, y: -40, colorIndex: hashColorIndex('Дизайн') },
  { id: 'philosophy', label: 'Философия', x: -60, y: 120, colorIndex: hashColorIndex('Философия') },
  { id: 'business', label: 'Бизнес', x: 180, y: 140, colorIndex: hashColorIndex('Бизнес') },
  { id: 'ai', label: 'AI', x: 20, y: -160, colorIndex: hashColorIndex('AI') },
];

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

interface UniverseScreenProps {
  onBack?: () => void;
}

const InnerUniverse: React.FC<UniverseScreenProps> = ({ onBack }) => {
  const [nodes, setNodes] = useState<UniverseNode[]>(() => INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<{ label: string }[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [contactUiState, setContactUiState] = useState<'open' | 'collapsed'>('open');
  const [contactVisible, setContactVisible] = useState(false);
  const [contactMounted, setContactMounted] = useState(false);
  const [contactAnimating, setContactAnimating] = useState(false);
  const { view, containerRef, handlePointerDown } = useZoomPan();
  const personality = useMemo(() => getPersonality(nodes.map((node) => node.label)), [nodes]);
  const activeNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);
  const { theme } = useTheme();
  const getVisual = useCallback((label: string) => resolveNodeVisual(label, theme), [theme]);

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
    setNodes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: trimmed, x: worldX, y: worldY, colorIndex: hashColorIndex(trimmed) },
    ]);
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
      const existing = new Set(interestList.map((item) => item.toLowerCase()));
      const filtered = recs.filter((label) => !existing.has(label.toLowerCase()));
      if (!filtered.length) {
        setRecommendError('Пока нет новых рекомендаций');
      }
      setRecommendations(filtered.slice(0, 7).map((label) => ({ label })));
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
      setIsRecommendOpen(false);
    }
  };

  useEffect(() => {
    if (isRecommendOpen) {
      refreshRecommendations();
    }
  }, [isRecommendOpen, refreshRecommendations]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('horizon_contact_ui') : null;
    if (stored === 'collapsed') {
      setContactUiState('collapsed');
      setContactMounted(true);
      return undefined;
    }
    setContactUiState('open');
    setContactMounted(true);
    const timer = setTimeout(() => setContactVisible(true), 180);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseContactCard = () => {
    setContactAnimating(true);
    setContactVisible(false);
    try {
      window.localStorage.setItem('horizon_contact_ui', 'collapsed');
    } catch {
      // ignore
    }
    setTimeout(() => {
      setContactUiState('collapsed');
      setContactAnimating(false);
    }, 240);
  };

  const handleOpenContactCard = () => {
    setContactAnimating(true);
    setContactUiState('open');
    setContactMounted(true);
    setContactVisible(true);
    try {
      window.localStorage.setItem('horizon_contact_ui', 'open');
    } catch {
      // ignore
    }
    setTimeout(() => setContactAnimating(false), 240);
  };

  const handleMoveNode = (id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x: position.x, y: position.y } : node)));
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
  };

  return (
    <div className={`${theme} relative h-screen w-screen overflow-hidden bg-[var(--bg-color)]`} data-theme={theme}>
      <div className="starry-layer pointer-events-none fixed inset-0" aria-hidden />

      <div className="world-layer fixed inset-0">
        <UniverseCanvas
          nodes={nodes}
          edges={edges}
          view={view}
          onMoveNode={handleMoveNode}
          onNodeClick={handleNodeClick}
          containerRef={containerRef}
          onBackgroundPointerDown={handlePointerDown}
          theme={theme}
        />
      </div>

      <div className="overlay-layer pointer-events-none fixed inset-0">
        {activeNode ? <NodeInfoCard node={activeNode} view={view} onClose={() => setSelectedNodeId(null)} /> : null}
      </div>

      <UIHeader
        personalityName={personality.name}
        onAdd={() => setAddModalOpen(true)}
        onToggleDrawer={() => setIsRecommendOpen((prev) => !prev)}
        onBack={onBack}
      />

      <RecommendDrawer
        open={isRecommendOpen}
        loading={recommendLoading}
        error={recommendError}
        items={recommendations}
        onClose={() => setIsRecommendOpen(false)}
        onRefresh={refreshRecommendations}
        onAdd={handleAddFromRecommendation}
        getColorForLabel={getVisual}
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
        <div className="rounded-md bg-black/50 px-4 py-2 text-xs font-semibold text-gray-200 shadow-lg backdrop-blur-md dark:bg-white/20 dark:text-gray-800">
          Колесо — масштаб · Тяни фон — панорама · Клик по узлу — карточка
        </div>
      </div>

      {contactMounted && contactUiState === 'open' ? (
        <div className="fixed bottom-4 left-4 z-40 max-w-full pr-4 sm:bottom-6 sm:left-6 sm:pr-0" data-ui-layer="true">
          <ContactCard visible={contactVisible} onClose={handleCloseContactCard} />
        </div>
      ) : null}

      {contactUiState === 'collapsed' ? (
        <div className="fixed bottom-4 left-4 z-30 pr-4 sm:bottom-6 sm:left-6 sm:pr-0" data-ui-layer="true">
          <button
            type="button"
            aria-label="Открыть чат в Telegram"
            onClick={contactAnimating ? undefined : handleOpenContactCard}
            className={`group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:scale-[1.05] hover:bg-[var(--hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              contactAnimating ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-xl" aria-hidden>
              💬
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default function UniverseScreen(props: UniverseScreenProps) {
  return <InnerUniverse {...props} />;
}
