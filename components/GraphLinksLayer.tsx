import React, { useMemo } from 'react';
import type { UniverseEdge, UniverseNode } from './UniverseCanvas';

const NODE_RADIUS = 32;
const ARROW_PADDING = 6;

interface GraphLinksLayerProps {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
}

export const GraphLinksLayer: React.FC<GraphLinksLayerProps> = ({ nodes, edges }) => {
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

        const startX = source.x + ux * NODE_RADIUS;
        const startY = source.y + uy * NODE_RADIUS;
        const endX = target.x - ux * (NODE_RADIUS + ARROW_PADDING);
        const endY = target.y - uy * (NODE_RADIUS + ARROW_PADDING);

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
  }, [edges, nodeById]);

  if (!geometry) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      style={{
        transform: `translate(${geometry.minX}px, ${geometry.minY}px)`,
        width: `${geometry.width}px`,
        height: `${geometry.height}px`,
      }}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      aria-hidden
    >
      <defs>
        <marker id="arrowhead" markerWidth="14" markerHeight="14" refX="9" refY="6" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,12 L12,6 z" fill="url(#linkGradient)" />
        </marker>
        <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9f6bff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#6f87ff" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {geometry.edges.map((edge) => (
        <line
          key={edge.id}
          x1={edge.startX - geometry.minX}
          y1={edge.startY - geometry.minY}
          x2={edge.endX - geometry.minX}
          y2={edge.endY - geometry.minY}
          stroke="url(#linkGradient)"
          strokeWidth={1.6}
          strokeOpacity={0.5}
          markerEnd="url(#arrowhead)"
          className="drop-shadow-[0_0_12px_rgba(124,157,255,0.35)]"
        />
      ))}
    </svg>
  );
};
