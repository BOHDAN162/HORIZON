import React, { useMemo } from 'react';

export type Edge = { id: string; sourceId: string; targetId: string };
export type NodePosition = { id: string; x: number; y: number };

type Props = {
  nodes: NodePosition[];
  edges: Edge[];
  radius: number;
};

export const EdgeLayer: React.FC<Props> = ({ nodes, edges, radius }) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodePosition>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  const lines = useMemo(() => {
    const padded = radius + 3;
    return edges
      .map((edge) => {
        const source = nodeMap.get(edge.sourceId);
        const target = nodeMap.get(edge.targetId);
        if (!source || !target) return null;
        const sx = source.x;
        const sy = source.y;
        const tx = target.x;
        const ty = target.y;

        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.hypot(dx, dy);
        if (!dist) return null;

        const ux = dx / dist;
        const uy = dy / dist;

        return {
          id: edge.id,
          x1: sx + ux * padded,
          y1: sy + uy * padded,
          x2: tx - ux * padded,
          y2: ty - uy * padded,
        };
      })
      .filter(Boolean) as Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
  }, [edges, nodeMap, radius]);

  return (
    <svg className="pointer-events-none absolute inset-0" width="100%" height="100%" aria-hidden>
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="var(--edge-color)"
          strokeWidth={1.5}
          strokeOpacity={0.45}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
