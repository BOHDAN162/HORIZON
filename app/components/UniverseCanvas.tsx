import React, { useMemo } from 'react';
import { EdgeLayer, Edge } from './EdgeLayer';
import { Node } from './Node';
import { ViewportState } from '@/lib/useZoomPan';

export type UniverseNode = { id: string; label: string; x: number; y: number; color: string };

type Props = {
  nodes: UniverseNode[];
  edges: Edge[];
  view: ViewportState;
  onMoveNode: (id: string, position: { x: number; y: number }) => void;
  onNodeClick: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onBackgroundPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
};

const NODE_RADIUS = 28;

const palette = [
  'linear-gradient(135deg,#7c9dff,#5ec2ff)',
  'linear-gradient(135deg,#9f6bff,#6fd1ff)',
  'linear-gradient(135deg,#6b9fff,#c86bff)',
  'linear-gradient(135deg,#6fe0ff,#6f87ff)',
  'linear-gradient(135deg,#8fb3ff,#9f6bff)',
];

export const UniverseCanvas: React.FC<Props> = ({
  nodes,
  edges,
  view,
  onMoveNode,
  onNodeClick,
  containerRef,
  onBackgroundPointerDown,
}) => {
  const coloredNodes = useMemo(
    () => nodes.map((node, index) => ({ ...node, color: node.color || palette[index % palette.length] })),
    [nodes]
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none"
      onPointerDown={onBackgroundPointerDown}
      data-world-layer
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${view.offsetX}px, ${view.offsetY}px, 0) scale(${view.scale})`,
          transformOrigin: '0 0',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <EdgeLayer nodes={coloredNodes} edges={edges} radius={NODE_RADIUS} />
        {coloredNodes.map((node) => (
          <Node key={node.id} node={node} view={view} radius={NODE_RADIUS} onMove={onMoveNode} onClick={onNodeClick} />
        ))}
      </div>
    </div>
  );
};
