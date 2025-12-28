'use client';

import React from 'react';
import { Drawer } from './Drawer';
import { NodePanel } from './NodePanel';
import { InterestNode } from './types';

type Props = {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  recommendations: string[];
  recommendLoading: boolean;
  recommendError: string;
  onRefreshRecommendations: () => Promise<void>;
  onAddRecommendation: (label: string) => void;
  selectedNode: InterestNode | null;
  onClosePanel: () => void;
  onDeleteNode: (id: string) => void;
};

export const Overlay: React.FC<Props> = ({
  isDrawerOpen,
  onToggleDrawer,
  recommendations,
  recommendLoading,
  recommendError,
  onRefreshRecommendations,
  onAddRecommendation,
  selectedNode,
  onClosePanel,
  onDeleteNode,
}) => {
  return (
    <div className="pointer-events-none fixed inset-0" data-ui-layer="true">
      <button
        type="button"
        onClick={onToggleDrawer}
        className="pointer-events-auto fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] shadow-[0_14px_45px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label="Открыть меню интересов"
      >
        <span className="text-lg" aria-hidden>
          ↗
        </span>
      </button>

      <Drawer
        open={isDrawerOpen}
        onClose={onToggleDrawer}
        recommendations={recommendations}
        loading={recommendLoading}
        error={recommendError}
        onRefresh={onRefreshRecommendations}
        onAdd={onAddRecommendation}
      />

      {selectedNode ? <NodePanel node={selectedNode} onClose={onClosePanel} onDelete={onDeleteNode} /> : null}
    </div>
  );
};
