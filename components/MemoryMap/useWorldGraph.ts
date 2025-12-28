import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InterestEdge, InterestNode, ViewState } from './types';
import { storage } from './storage';
import { fetchEdges, fetchInterestRecommendations } from '@/lib/api';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 4.2;
const MAX_EDGES_PER_NODE = 6;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type WorldState = {
  nodes: InterestNode[];
  edges: InterestEdge[];
  view: ViewState;
  selectedId: string | null;
  recommendations: string[];
  recommendLoading: boolean;
  recommendError: string;
};

export type WorldActions = {
  setSelected: (id: string | null) => void;
  moveNode: (id: string, x: number, y: number) => void;
  addNode: (label: string) => InterestNode | null;
  removeNode: (id: string) => void;
  addNodeFromRecommendation: (label: string) => InterestNode | null;
  refreshRecommendations: () => Promise<void>;
  setView: (updater: (prev: ViewState) => ViewState) => void;
};

const buildInitialNodes = (): InterestNode[] => {
  const stored = storage.loadNodes<InterestNode[]>();
  if (stored?.length) return stored;
  const seed = ['Технологии', 'Искусственный интеллект', 'Дизайн', 'Философия', 'Бизнес'];
  return seed.map((label, idx) => ({
    id: `seed-${idx}`,
    label,
    x: idx * 120 - 200,
    y: idx % 2 === 0 ? -80 * idx : 160,
    createdAt: Date.now() - idx * 1000,
  }));
};

const buildInitialEdges = (nodes: InterestNode[]): InterestEdge[] => {
  const stored = storage.loadEdges<InterestEdge[]>();
  if (stored?.length) return stored;
  if (nodes.length < 2) return [];
  return nodes.slice(0, nodes.length - 1).map((node, idx) => ({
    id: `seed-edge-${idx}`,
    source: node.id,
    target: nodes[idx + 1].id,
    type: 'mesh',
    weight: 1,
  }));
};

const restoreView = (container?: HTMLDivElement | null): ViewState => {
  const stored = storage.loadView();
  if (stored) {
    return { panX: stored.panX, panY: stored.panY, zoom: clamp(stored.zoom, MIN_ZOOM, MAX_ZOOM) };
  }
  if (container) {
    const rect = container.getBoundingClientRect();
    return { panX: rect.width / 2, panY: rect.height / 2, zoom: 1.1 };
  }
  return { panX: 0, panY: 0, zoom: 1 };
};

const persistGraph = (nodes: InterestNode[], edges: InterestEdge[]) => {
  storage.saveNodes(nodes);
  storage.saveEdges(edges);
};

const cursorToWorld = (clientX: number, clientY: number, view: ViewState, rect: DOMRect) => {
  const worldX = (clientX - rect.left - view.panX) / view.zoom;
  const worldY = (clientY - rect.top - view.panY) / view.zoom;
  return { worldX, worldY };
};

export const useWorldGraph = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [nodes, setNodes] = useState<InterestNode[]>(() => buildInitialNodes());
  const [edges, setEdges] = useState<InterestEdge[]>(() => buildInitialEdges(buildInitialNodes()));
  const [view, setView] = useState<ViewState>(() => ({ panX: 0, panY: 0, zoom: 1 }));
  const [selectedId, setSelectedId] = useState<string | null>(storage.loadLastSelected());
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState('');

  useEffect(() => {
    persistGraph(nodes, edges);
  }, [nodes, edges]);

  useEffect(() => {
    storage.saveView({ panX: view.panX, panY: view.panY, zoom: view.zoom });
  }, [view]);

  useEffect(() => {
    const container = containerRef.current;
    setView(restoreView(container));
  }, [containerRef]);

  useEffect(() => {
    storage.saveLastSelected(selectedId);
  }, [selectedId]);

  const addNode = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return null;
      const exists = nodes.some((n) => n.label.toLowerCase() === trimmed.toLowerCase());
      if (exists) return null;
      const container = containerRef.current;
      const rect = container ? container.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      const { worldX, worldY } = cursorToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, view, rect);
      const newNode: InterestNode = {
        id: crypto.randomUUID(),
        label: trimmed,
        x: worldX,
        y: worldY,
        fx: worldX,
        fy: worldY,
        createdAt: Date.now(),
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode;
    },
    [nodes, containerRef, view]
  );

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x, y, fx: x, fy: y } : node)));
  }, []);

  const refreshEdges = useCallback(
    async (currentNodes: InterestNode[]) => {
      const labels = currentNodes.map((n) => n.label);
      try {
        const apiEdges = await fetchEdges(labels, MAX_EDGES_PER_NODE);
        const labelToId = new Map(currentNodes.map((node) => [node.label, node.id]));
        const mapped: InterestEdge[] = apiEdges
          .map((edge, idx) => {
            const source = labelToId.get(edge.source);
            const target = labelToId.get(edge.target);
            if (!source || !target || source === target) return null;
            return { id: edge.source + edge.target + idx, source, target, type: 'mesh', weight: 1 };
          })
          .filter(Boolean) as InterestEdge[];
        setEdges(mapped);
      } catch {
        const fallback: InterestEdge[] = [];
        for (let i = 0; i < currentNodes.length - 1; i += 1) {
          fallback.push({ id: `${currentNodes[i].id}-${currentNodes[i + 1].id}`, source: currentNodes[i].id, target: currentNodes[i + 1].id });
        }
        setEdges(fallback);
      }
    },
    []
  );

  useEffect(() => {
    refreshEdges(nodes);
  }, [nodes, refreshEdges]);

  const refreshRecommendations = useCallback(async () => {
    setRecommendLoading(true);
    setRecommendError('');
    try {
      const labels = nodes.map((n) => n.label);
      if (!labels.length) {
        setRecommendError('Добавьте хотя бы один интерес');
        return;
      }
      const recs = await fetchInterestRecommendations(labels);
      const existing = new Set(labels.map((l) => l.toLowerCase()));
      const filtered = recs.filter((label) => !existing.has(label.toLowerCase())).slice(0, 12);
      setRecommendations(filtered);
    } catch {
      setRecommendError('Не удалось загрузить рекомендации');
      setRecommendations([]);
    } finally {
      setRecommendLoading(false);
    }
  }, [nodes]);

  const addNodeFromRecommendation = useCallback(
    (label: string) => {
      const node = addNode(label);
      if (node) {
        setRecommendations((prev) => prev.filter((item) => item.toLowerCase() !== label.toLowerCase()));
      }
      return node;
    },
    [addNode]
  );

  const actions: WorldActions = useMemo(
    () => ({
      setSelected: setSelectedId,
      moveNode,
      addNode,
      removeNode,
      addNodeFromRecommendation,
      refreshRecommendations,
      setView,
    }),
    [addNode, addNodeFromRecommendation, moveNode, refreshRecommendations, removeNode]
  );

  const state: WorldState = useMemo(
    () => ({ nodes, edges, view, selectedId, recommendations, recommendLoading, recommendError }),
    [nodes, edges, view, selectedId, recommendations, recommendLoading, recommendError]
  );

  return { state, actions };
};
