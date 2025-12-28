import React, { useMemo, useRef, useState } from 'react';
import { ViewportState } from '@/lib/useZoomPan';
import { NodeVisual } from '@/lib/nodeColors';

type Props = {
  node: { id: string; label: string; x: number; y: number };
  view: ViewportState;
  radius: number;
  visual: NodeVisual;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onClick: (id: string) => void;
};

export const Node: React.FC<Props> = ({ node, view, radius, visual, onMove, onClick }) => {
  const [dragging, setDragging] = useState(false);
  const pointerRef = useRef<{ startX: number; startY: number; startNodeX: number; startNodeY: number } | null>(null);

  const style = useMemo(() => ({ transform: `translate(${node.x - radius}px, ${node.y - radius}px)` }), [node.x, node.y, radius]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    pointerRef.current = { startX: event.clientX, startY: event.clientY, startNodeX: node.x, startNodeY: node.y };
    setDragging(false);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = (event.clientX - pointerRef.current.startX) / view.scale;
    const dy = (event.clientY - pointerRef.current.startY) / view.scale;
    const newX = pointerRef.current.startNodeX + dx;
    const newY = pointerRef.current.startNodeY + dy;
    onMove(node.id, { x: newX, y: newY });
    if (Math.abs(dx) + Math.abs(dy) > 2) {
      setDragging(true);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!dragging) {
      onClick(node.id);
    }
    pointerRef.current = null;
    setDragging(false);
  };

  return (
    <div
      data-node
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(node.id);
        }
      }}
      className="absolute select-none"
      style={style}
    >
      <div
        className="group flex items-center gap-3 rounded-full px-1 py-1"
        style={{ color: visual.text }}
      >
        <div
          className="relative grid h-9 w-9 place-items-center rounded-full transition-transform duration-150 group-hover:scale-[1.08]"
          style={{
            backgroundImage: visual.gradient,
            boxShadow: `0 12px 28px rgba(0,0,0,0.32), 0 0 0 6px rgba(255,255,255,0.04), 0 0 24px ${visual.glow}`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-white/6 opacity-0 blur-lg transition-opacity duration-150 group-hover:opacity-60" />
        </div>
        <span
          className="rounded-md px-2.5 py-1 text-[13px] font-medium tracking-tight text-[var(--text-primary)] shadow-[var(--node-label-shadow)] backdrop-blur-sm transition-colors group-hover:text-white"
          style={{ background: 'var(--node-label-bg)' }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
};
