import React, { useId, useMemo } from 'react';
import type { UniverseEdge, UniverseNode } from './UniverseCanvas';

interface GraphLinksLayerProps {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  nodeRadius: number;
  arrowPadding: number;
}

export const GraphLinksLayer: React.FC<GraphLinksLayerProps> = ({ nodes, edges, nodeRadius, arrowPadding }) => {
  const gradientId = useId();
  const markerId = useId();
  const nodeById = useMemo(() => {
    const map = new Map<string, UniverseNode>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const geometry = useMemo(() => {
    const validEdges = edges
      .map((edge) => {
        const source = nodeById.get(edge.sourceId);
        const target = nodeById.get(edge.targetId);
        if (!source || !target || (source.x === target.x && source.y === target.y)) return null;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.hypot(dx, dy);
        if (!distance) return null;

        const ux = dx / distance;
        const uy = dy / distance;

        const startX = source.x + ux * (nodeRadius + arrowPadding);
        const startY = source.y + uy * (nodeRadius + arrowPadding);
        const endX = target.x - ux * (nodeRadius + arrowPadding + 2);
        const endY = target.y - uy * (nodeRadius + arrowPadding + 2);

        return {
          id: edge.id,
          startX,
          startY,
          endX,
          endY,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }>;

    if (!validEdges.length) return null;

    const xs = validEdges.flatMap((edge) => [edge.startX, edge.endX]);
    const ys = validEdges.flatMap((edge) => [edge.startY, edge.endY]);

    const margin = 80;
    const minX = Math.min(...xs) - margin;
    const maxX = Math.max(...xs) + margin;
    const minY = Math.min(...ys) - margin;
    const maxY = Math.max(...ys) + margin;

    return {
      minX,
      minY,
      width: Math.max(maxX - minX, 1),
      height: Math.max(maxY - minY, 1),
      edges: validEdges,
    };
  }, [arrowPadding, edges, nodeById, nodeRadius]);

  if (!geometry) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      style={{
        transform: `translate(${geometry.minX}px, ${geometry.minY}px)`,
      }}
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gradientId}-link`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a4b5ff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#6f87ff" stopOpacity="0.55" />
        </linearGradient>
        <marker
          id={`${markerId}-arrow`}
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M1,1 L1,9 L9,5 z" fill={`url(#${gradientId}-link)`} />
        </marker>
      </defs>

      {geometry.edges.map((edge) => (
        <line
          key={edge.id}
          x1={edge.startX - geometry.minX}
          y1={edge.startY - geometry.minY}
          x2={edge.endX - geometry.minX}
          y2={edge.endY - geometry.minY}
          stroke={`url(#${gradientId}-link)`}
          strokeWidth={1.25}
          strokeOpacity={0.6}
          strokeLinecap="round"
          markerEnd={`url(#${markerId}-arrow)`}
          className="edge-line drop-shadow-[0_0_12px_rgba(124,157,255,0.35)]"
        />
      ))}
    </svg>
  );
};
