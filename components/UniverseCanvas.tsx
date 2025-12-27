import React, { useEffect, useRef, useState } from 'react';
import { GraphLinksLayer } from './GraphLinksLayer';

export interface UniverseNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface UniverseEdge {
  id: string;
  sourceId: string;
  targetId: string;
  strength?: number;
}

export interface UniverseView {
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface UniverseCanvasProps {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  view: UniverseView;
  setView: React.Dispatch<React.SetStateAction<UniverseView>>;
  onMoveNode: (id: string, delta: { dx: number; dy: number }) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
export const NODE_RADIUS = 14;
const EDGE_PADDING = 6;
const palette = [
  'from-[#7c9dff] to-[#5ec2ff]',
  'from-[#9f6bff] to-[#6fd1ff]',
  'from-[#6b9fff] to-[#c86bff]',
  'from-[#6fe0ff] to-[#6f87ff]',
  'from-[#8fb3ff] to-[#9f6bff]',
];

export const UniverseCanvas: React.FC<UniverseCanvasProps> = ({ nodes, edges, view, setView, onMoveNode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const draggingNodeIdRef = useRef<string | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const viewRef = useRef(view);
  const rafRef = useRef<number | null>(null);
  const inertiaRef = useRef<number | null>(null);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMoveTsRef = useRef<number | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!lastPointerRef.current) return;

      const deltaX = event.clientX - lastPointerRef.current.x;
      const deltaY = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      if (draggingNodeIdRef.current) {
        const currentScale = viewRef.current.scale;
        onMoveNode(draggingNodeIdRef.current, { dx: deltaX / currentScale, dy: deltaY / currentScale });
        return;
      }

      if (isPanningRef.current) {
        const now = performance.now();
        if (lastMoveTsRef.current) {
          const dt = now - lastMoveTsRef.current || 16;
          velocityRef.current = { vx: deltaX / dt, vy: deltaY / dt };
        }
        lastMoveTsRef.current = now;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setView((prev) => ({
            ...prev,
            offsetX: prev.offsetX + deltaX,
            offsetY: prev.offsetY + deltaY,
          }));
        });
      }
    };

    const startInertia = () => {
      if (draggingNodeIdRef.current) return;
      if (inertiaRef.current) cancelAnimationFrame(inertiaRef.current);
      let lastTs: number | null = null;

      const step = (timestamp: number) => {
        if (lastTs === null) {
          lastTs = timestamp;
          inertiaRef.current = requestAnimationFrame(step);
          return;
        }

        const dt = timestamp - lastTs;
        lastTs = timestamp;
        const { vx, vy } = velocityRef.current;
        const speed = Math.hypot(vx, vy);
        if (speed < 0.02) {
          inertiaRef.current = null;
          return;
        }

        setView((prev) => ({
          ...prev,
          offsetX: prev.offsetX + vx * dt * 12,
          offsetY: prev.offsetY + vy * dt * 12,
        }));

        velocityRef.current = { vx: vx * 0.88, vy: vy * 0.88 };
        inertiaRef.current = requestAnimationFrame(step);
      };

      inertiaRef.current = requestAnimationFrame(step);
    };

    const handleMouseUp = () => {
      const shouldInertia = isPanningRef.current && !draggingNodeIdRef.current;
      isPanningRef.current = false;
      setIsPanning(false);
      draggingNodeIdRef.current = null;
      lastPointerRef.current = null;
      lastMoveTsRef.current = null;
      if (shouldInertia) {
        startInertia();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onMoveNode, setView]);

  const handleMouseDownBackground: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return;
    if (inertiaRef.current) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
    isPanningRef.current = true;
    setIsPanning(true);
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    lastMoveTsRef.current = performance.now();
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handleNodeMouseDown = (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (inertiaRef.current) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
    draggingNodeIdRef.current = id;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    lastMoveTsRef.current = performance.now();
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setView((prev) => {
      const scaleFactor = 1 - event.deltaY * 0.0011;
      const nextScale = clamp(prev.scale * scaleFactor, 0.4, 2.5);
      const currentScale = prev.scale;

      const worldX = (cursorX - centerX - prev.offsetX) / currentScale;
      const worldY = (cursorY - centerY - prev.offsetY) / currentScale;

      const newOffsetX = cursorX - centerX - worldX * nextScale;
      const newOffsetY = cursorY - centerY - worldY * nextScale;

      return { offsetX: newOffsetX, offsetY: newOffsetY, scale: nextScale };
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownBackground}
      onWheel={handleWheel}
      onMouseLeave={() => {
        isPanningRef.current = false;
        draggingNodeIdRef.current = null;
        lastPointerRef.current = null;
        setIsPanning(false);
      }}
      className={`cosmic-surface relative isolate h-full w-full select-none overflow-hidden bg-[rgba(10,16,28,0.7)] shadow-[0_30px_120px_rgba(0,0,0,0.45)] touch-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div className="cosmic-stars pointer-events-none absolute inset-0" aria-hidden />

      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.scale})`,
        }}
      >
        <div className="pointer-events-none relative">
          <div className="absolute inset-0">
            <GraphLinksLayer nodes={nodes} edges={edges} nodeRadius={NODE_RADIUS} arrowPadding={EDGE_PADDING} />
          </div>
        </div>

        {nodes.map((node, index) => {
          const colorClass = palette[index % palette.length];
          return (
            <div
              key={node.id}
              onMouseDown={handleNodeMouseDown(node.id)}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center gap-3 rounded-full px-2 py-1 text-sm font-semibold text-white transition active:cursor-grabbing"
              style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
              aria-label={node.label}
            >
              <div
                className={`planet-core grid h-7 w-7 place-items-center rounded-full border-2 border-white/15 bg-gradient-to-br ${colorClass} shadow-[0_10px_26px_rgba(111,135,255,0.4)] transition-transform duration-150 group-hover:scale-[1.18] group-active:scale-[1.12]`}
              />
              <span className="pointer-events-none rounded-lg bg-[rgba(10,16,28,0.72)] px-2.5 py-1 text-[13px] font-medium text-[rgba(233,238,247,0.9)] backdrop-blur-sm transition-colors group-hover:text-white group-active:text-white">
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
