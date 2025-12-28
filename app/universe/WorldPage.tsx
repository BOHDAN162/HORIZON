'use client';

import React, { useMemo, useRef, useState } from 'react';
import { WorldCanvas } from '@/components/MemoryMap/WorldCanvas';
import { Overlay } from '@/components/MemoryMap/Overlay';
import { useWorldGraph } from '@/components/MemoryMap/useWorldGraph';
import { useTheme } from '@/lib/useTheme';
import { AppProviders } from '../providers';

const InnerWorld = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { state, actions } = useWorldGraph(containerRef);
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selectedNode = useMemo(() => state.nodes.find((node) => node.id === state.selectedId) ?? null, [state.nodes, state.selectedId]);

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${theme}`} data-theme={theme}>
      <div className="fixed inset-0" ref={containerRef}>
        <WorldCanvas
          nodes={state.nodes}
          edges={state.edges}
          view={state.view}
          onMoveNode={(id, pos) => {
            actions.moveNode(id, pos.x, pos.y);
          }}
          onNodeClick={(id) => actions.setSelected(id)}
          containerRef={containerRef}
          onTransform={(panX, panY, zoom) => {
            actions.setView(() => ({ panX, panY, zoom }));
          }}
        />
      </div>

      <Overlay
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        recommendations={state.recommendations}
        recommendLoading={state.recommendLoading}
        recommendError={state.recommendError}
        onRefreshRecommendations={actions.refreshRecommendations}
        onAddRecommendation={(label) => {
          actions.addNodeFromRecommendation(label);
          actions.setSelected(null);
        }}
        selectedNode={selectedNode}
        onClosePanel={() => actions.setSelected(null)}
        onDeleteNode={(id) => actions.removeNode(id)}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4" data-ui-layer="true">
        <div className="pointer-events-auto rounded-md bg-black/50 px-4 py-2 text-xs font-semibold text-gray-200 shadow-lg backdrop-blur-md">
          Колесо — масштаб · Тяни фон — панорама · Клик по узлу — карточка
        </div>
      </div>

      <button
        type="button"
        className="pointer-events-auto fixed right-4 top-4 z-50 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-md"
        onClick={toggleTheme}
        data-ui-layer="true"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default function WorldPage() {
  return (
    <AppProviders>
      <InnerWorld />
    </AppProviders>
  );
}
