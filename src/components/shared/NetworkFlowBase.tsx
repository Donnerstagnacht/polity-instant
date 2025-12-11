'use client';

import { ReactNode } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface NetworkFlowBaseProps<T extends Node = Node> {
  nodes: T[];
  edges: Edge[];
  onNodesChange?: OnNodesChange<T>;
  onEdgesChange?: OnEdgesChange;
  onNodeClick?: (event: any, node: Node) => void;
  onEdgeClick?: (event: any, edge: Edge) => void;
  nodesDraggable?: boolean;
  nodesFocusable?: boolean;
  nodesConnectable?: boolean;
  edgesFocusable?: boolean;
  panel: ReactNode;
  onInteractiveChange?: (interactive: boolean) => void;
  children?: ReactNode;
}

export function NetworkFlowBase<T extends Node = Node>({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  nodesDraggable = true,
  nodesFocusable = true,
  nodesConnectable = true,
  edgesFocusable = true,
  panel,
  onInteractiveChange,
  children,
}: NetworkFlowBaseProps<T>) {
  return (
    <div className="h-[600px] w-full rounded-lg border bg-background">
      <style jsx global>{`
        /* Dark mode styles for ReactFlow controls */
        .dark .react-flow__controls {
          button {
            background-color: hsl(var(--background));
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
          }

          button:hover {
            background-color: hsl(var(--accent));
          }

          button path {
            fill: currentColor;
          }
        }

        /* Dark mode styles for MiniMap */
        .dark .react-flow__minimap {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
        }

        .dark .react-flow__minimap-mask {
          fill: hsl(var(--muted) / 0.3);
        }

        /* Dark mode styles for Panel */
        .dark .react-flow__panel {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={nodesDraggable}
        nodesFocusable={nodesFocusable}
        nodesConnectable={nodesConnectable}
        edgesFocusable={edgesFocusable}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
      >
        {panel}
        <Controls onInteractiveChange={onInteractiveChange} />
        <MiniMap zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      {children}
    </div>
  );
}

export { Panel };
