import React, { useMemo } from 'react';
import { EdgeLayer, Edge } from './EdgeLayer';
import { Node } from './Node';
import { ViewportState } from '@/lib/useZoomPan';
import { getNodeVisual, ThemeMode } from '@/lib/nodeColors';

export type UniverseNode = { id: string; label: string; x: number; y: number; colorIndex: number };

type Props = {
  nodes: UniverseNode[];
  edges: Edge[];
  view: ViewportState;
  onMoveNode: (id: string, position: { x: number; y: number }) => void;
  onNodeClick: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onBackgroundPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  theme: ThemeMode;
};

const NODE_RADIUS = 18;

export const UniverseCanvas: React.FC<Props> = ({
  nodes,
  edges,
  view,
  onMoveNode,
  onNodeClick,
  containerRef,
  onBackgroundPointerDown,
  theme,
}) => {
  const coloredNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        visual: getNodeVisual(node.colorIndex, theme),
      })),
    [nodes, theme]
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
        }}
      >
        <div className="pointer-events-none absolute -left-[2000px] -top-[2000px] h-[4000px] w-[4000px] opacity-70">
          <div className="h-full w-full bg-[radial-gradient(1px_1px_at_15%_25%,rgba(255,255,255,0.65),transparent),radial-gradient(1.5px_1.5px_at_35%_70%,rgba(121,176,255,0.65),transparent),radial-gradient(1.2px_1.2px_at_75%_20%,rgba(177,138,255,0.6),transparent),radial-gradient(1px_1px_at_55%_45%,rgba(255,255,255,0.5),transparent),radial-gradient(1.4px_1.4px_at_85%_80%,rgba(126,167,255,0.55),transparent),radial-gradient(1px_1px_at_5%_60%,rgba(255,255,255,0.52),transparent)]" />
        </div>
        <EdgeLayer nodes={coloredNodes} edges={edges} radius={NODE_RADIUS} />
        {coloredNodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            view={view}
            radius={NODE_RADIUS}
            visual={node.visual}
            onMove={onMoveNode}
            onClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
};
