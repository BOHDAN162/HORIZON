import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ViewportState = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

const ZOOM_SPEED = 0.001;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useZoomPan = () => {
  const [view, setView] = useState<ViewportState>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.('[data-ui-layer="true"]')) return;
      if (!containerRef.current) return;
      event.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      setView((prev) => {
        const scaleDelta = -event.deltaY * ZOOM_SPEED;
        const nextScale = clamp(prev.scale + prev.scale * scaleDelta, MIN_SCALE, MAX_SCALE);
        const worldX = (cursorX - prev.offsetX) / prev.scale;
        const worldY = (cursorY - prev.offsetY) / prev.scale;

        const newOffsetX = cursorX - worldX * nextScale;
        const newOffsetY = cursorY - worldY * nextScale;

        return { offsetX: newOffsetX, offsetY: newOffsetY, scale: nextScale };
      });
    },
    [setView]
  );

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if ((event.target as HTMLElement | null)?.closest('[data-node]')) return;
    if ((event.target as HTMLElement | null)?.closest('[data-ui-layer="true"]')) return;
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    container.setPointerCapture(event.pointerId);
    panStartRef.current = { x: event.clientX, y: event.clientY, offsetX: view.offsetX, offsetY: view.offsetY };
    setIsPanning(true);
  }, [view.offsetX, view.offsetY]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!panStartRef.current) return;
      event.preventDefault();
      const deltaX = event.clientX - panStartRef.current.x;
      const deltaY = event.clientY - panStartRef.current.y;
      stopAnimation();
      animationRef.current = requestAnimationFrame(() => {
        setView((prev) => ({
          ...prev,
          offsetX: panStartRef.current ? panStartRef.current.offsetX + deltaX : prev.offsetX,
          offsetY: panStartRef.current ? panStartRef.current.offsetY + deltaY : prev.offsetY,
        }));
      });
    },
    [setView, stopAnimation]
  );

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId);
    }
    panStartRef.current = null;
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const wheelListener = (event: WheelEvent) => handleWheel(event);
    const pointerMove = (event: PointerEvent) => handlePointerMove(event);
    const pointerUp = (event: PointerEvent) => handlePointerUp(event);
    container.addEventListener('wheel', wheelListener, { passive: false });
    container.addEventListener('pointermove', pointerMove);
    container.addEventListener('pointerup', pointerUp);
    container.addEventListener('pointercancel', pointerUp);
    return () => {
      container.removeEventListener('wheel', wheelListener);
      container.removeEventListener('pointermove', pointerMove);
      container.removeEventListener('pointerup', pointerUp);
      container.removeEventListener('pointercancel', pointerUp);
    };
  }, [handlePointerMove, handlePointerUp, handleWheel]);

  return {
    view,
    setView,
    isPanning,
    setIsPanning,
    containerRef,
    handlePointerDown,
  };
};
