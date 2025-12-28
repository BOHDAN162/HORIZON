import React, { useMemo, useRef, useState } from 'react';
import { ViewportState } from '@/lib/useZoomPan';

type Props = {
  node: { id: string; label: string; x: number; y: number; color: string };
  view: ViewportState;
  radius: number;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onClick: (id: string) => void;
};

export const Node: React.FC<Props> = ({ node, view, radius, onMove, onClick }) => {
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
        className="group grid h-[48px] min-w-[48px] place-items-center rounded-full border-2 border-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.25)] transition-transform duration-150 hover:scale-[1.08]"
        style={{ background: node.color }}
      >
        <span className="whitespace-nowrap rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
          {node.label}
        </span>
      </div>
    </div>
  );
};
