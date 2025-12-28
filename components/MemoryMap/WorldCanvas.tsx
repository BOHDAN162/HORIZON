/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d';
import { InterestEdge, InterestNode, ViewState } from './types';

type Props = {
  nodes: InterestNode[];
  edges: InterestEdge[];
  view: ViewState;
  onMoveNode: (id: string, pos: { x: number; y: number }) => void;
  onNodeClick: (id: string | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onTransform: (panX: number, panY: number, zoom: number) => void;
};

type GraphNode = NodeObject & InterestNode & { color: string; labelWidth?: number };
type GraphEdge = LinkObject & InterestEdge;

const NODE_RADIUS = 12;

export const WorldCanvas: React.FC<Props> = ({
  nodes,
  edges,
  view,
  onMoveNode,
  onNodeClick,
  containerRef,
  onTransform,
}) => {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphEdge>>();
  const draggingNode = useRef<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const setVelocityDecay = (ref: unknown, value: number) => {
    const r = ref as { d3VelocityDecay?: (v: number) => void; d3AlphaDecay?: (v: number) => void } | null;
    if (!r) return;
    if (typeof r.d3VelocityDecay === 'function') {
      r.d3VelocityDecay(value);
      return;
    }
    if (typeof r.d3AlphaDecay === 'function') {
      const adjusted = Math.min(0.05, Math.max(0.001, value / 10));
      r.d3AlphaDecay(adjusted);
    }
  };

  const graphData = useMemo(() => {
    const mappedNodes: GraphNode[] = nodes.map((node) => ({
      ...node,
      color: 'rgba(130,150,255,0.95)',
    }));
    const mappedEdges: GraphEdge[] = edges.map((edge) => ({ ...edge }));
    return { nodes: mappedNodes, links: mappedEdges };
  }, [nodes, edges]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      setDimensions({ width: container.clientWidth, height: container.clientHeight });
    });
    observer.observe(container);
    setDimensions({ width: container.clientWidth, height: container.clientHeight });
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (!graphRef.current || !dimensions.width || !dimensions.height) return;
    const centerX = (dimensions.width / 2 - view.panX) / view.zoom;
    const centerY = (dimensions.height / 2 - view.panY) / view.zoom;
    graphRef.current.zoom(view.zoom, 0);
    graphRef.current.centerAt(centerX, centerY, 0);
  }, [view.panX, view.panY, view.zoom, dimensions.width, dimensions.height]);

  const renderNode = (nodeObj: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const node = nodeObj as GraphNode;
    const r = NODE_RADIUS;

    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(125, 140, 255, 0.95)';
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(140, 120, 255, 0.9)';
    ctx.fill();
    ctx.shadowBlur = 0;

    const label = node.label;
    const fontSize = Math.max(10, 14 / globalScale);
    ctx.font = `${fontSize}px 'Inter', system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    const textWidth = ctx.measureText(label).width;
    const padding = 12;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = fontSize + 8;
    const labelX = (node.x ?? 0);
    const labelY = (node.y ?? 0) - r - bgHeight;

    ctx.fillStyle = 'rgba(10,12,24,0.75)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(labelX - bgWidth / 2, labelY - bgHeight / 2, bgWidth, bgHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(228,234,255,0.95)';
    ctx.fillText(label, labelX, labelY);
  };

  return (
    <div ref={containerRef} className="h-full w-full" data-world-layer>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
        graphData={graphData}
        nodeRelSize={NODE_RADIUS}
        nodeLabel={(node) => (node as GraphNode).label}
        linkColor={() => 'rgba(129, 140, 248, 0.32)'}
        linkWidth={() => 1}
        linkDirectionalParticles={0}
        linkDirectionalArrowLength={0}
        linkCurvature={0}
        cooldownTicks={0}
        nodeCanvasObject={renderNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(n.x ?? 0, n.y ?? 0, NODE_RADIUS + 10, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeDrag={(node: GraphNode) => {
          draggingNode.current = node.id;
        }}
        onNodeDragEnd={(node: GraphNode) => {
          draggingNode.current = null;
          onMoveNode(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
        }}
        onNodeClick={(node: GraphNode) => onNodeClick(node.id)}
        onBackgroundClick={() => onNodeClick(null)}
        onZoom={(transform) => {
          onTransform(transform.x ?? 0, transform.y ?? 0, transform.k ?? 1);
        }}
        onZoomEnd={(transform) => {
          onTransform(transform.x ?? 0, transform.y ?? 0, transform.k ?? 1);
        }}
        onEngineTick={() => {
          if (!graphRef.current) return;
          setVelocityDecay(graphRef.current, 0.35);
          graphRef.current.d3Force('link')?.distance?.(120);
        }}
        backgroundColor="transparent"
        d3AlphaDecay={0.08}
        d3VelocityDecay={0.35}
        minZoom={0.3}
        maxZoom={4.5}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        onNodeDragMove={(node: GraphNode) => {
          onMoveNode(node.id, { x: node.x ?? 0, y: node.y ?? 0 });
        }}
      />
    </div>
  );
};
