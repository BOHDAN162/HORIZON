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

export const UniverseCanvas: React.FC<UniverseCanvasProps> = ({ nodes, edges, view, setView, onMoveNode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPanningRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const draggingNodeIdRef = useRef<string | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const viewRef = useRef(view);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
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

    const handleMouseUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
      draggingNodeIdRef.current = null;
      lastPointerRef.current = null;
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
    isPanningRef.current = true;
    setIsPanning(true);
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleNodeMouseDown = (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    draggingNodeIdRef.current = id;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
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
      const scaleFactor = 1 - event.deltaY * 0.0012;
      const nextScale = clamp(prev.scale * scaleFactor, 0.5, 2.8);
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
      className={`cosmic-surface relative isolate h-full w-full select-none overflow-hidden bg-[rgba(12,19,34,0.9)] shadow-[0_30px_120px_rgba(0,0,0,0.45)] touch-none ${
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
            <GraphLinksLayer nodes={nodes} edges={edges} />
          </div>
        </div>

        {nodes.map((node) => (
          <div
            key={node.id}
            onMouseDown={handleNodeMouseDown(node.id)}
            className="universe-node absolute flex cursor-grab flex-col items-center gap-2 rounded-full p-2 text-center text-sm font-semibold text-white transition active:cursor-grabbing"
            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
          >
            <div className="node-planet grid h-16 w-16 place-items-center rounded-full shadow-[0_15px_40px_rgba(111,135,255,0.38)] transition duration-150 hover:scale-[1.04]">
              <span className="text-[13px] font-bold text-white">{node.label[0]?.toUpperCase()}</span>
            </div>
            <span className="pointer-events-none block text-[13px] font-medium text-[rgba(233,238,247,0.9)]">
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
