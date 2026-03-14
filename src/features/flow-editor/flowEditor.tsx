import { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from 'reactflow';
import type { NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/features/shared/ui/ui/button.tsx';
import { Input } from '@/features/shared/ui/ui/input.tsx';
import { Label } from '@/features/shared/ui/ui/label.tsx';
import PositionableEdge from './PositionableEdge.tsx';
import './PositionableEdge.css';

// Define missing types since they're not exported
interface Connection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}

interface Node {
  id: string;
  position: { x: number; y: number };

  data: Record<string, unknown>;
  type?: string;
  style?: React.CSSProperties;
  parentId?: string;
  extent?: 'parent';
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  type?: string;
  style?: React.CSSProperties;
  data?: Record<string, unknown>;
}

// Custom Group Node component
//ts-expect-warn-next-line
const GroupNode = ({ data }: { data: { label: string }; selected: boolean }) => {
  return (
    <>
      <div
        className="group-node-label"
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          padding: '2px 5px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '3px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1,
        }}
      >
        {data.label}
      </div>
      {/* This is a wrapper that contains the child nodes */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }} />
    </>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  group: GroupNode,
};

const edgeTypes = {
  positionableedge: PositionableEdge,
};

// Initial nodes representing a city council workflow
const initialNodes: Node[] = [
  {
    id: '1',
    data: {
      label: 'Proposal Submission',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: {
      label: 'Initial Review',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    data: {
      label: 'Committee Assignment',
    },
    style: { background: '#ffe0b2', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    data: {
      label: 'Committee Review',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 100, y: 300 },
  },
  {
    id: '5',
    data: {
      label: 'Budget Analysis',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 400, y: 300 },
  },
  {
    id: '6',
    data: {
      label: 'Committee Vote',
    },
    style: { background: '#ffe0b2', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 400 },
  },
  {
    id: '7',
    data: {
      label: 'Council Agenda',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 500 },
  },
  {
    id: '8',
    data: {
      label: 'Public Hearing',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 600 },
  },
  {
    id: '9',
    data: {
      label: 'Council Vote',
    },
    style: { background: '#ffe0b2', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 700 },
  },
  {
    id: '10',
    data: {
      label: 'Mayor Signature',
    },
    style: { background: '#c8e6c9', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 800 },
  },
  {
    id: '11',
    data: {
      label: 'Implementation',
    },
    style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
    position: { x: 250, y: 900 },
  },
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    label: 'Policy Review',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    label: 'Budget Impact',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e6-7',
    source: '6',
    target: '7',
    label: 'Approved by Committee',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e7-8',
    source: '7',
    target: '8',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e8-9',
    source: '8',
    target: '9',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e9-10',
    source: '9',
    target: '10',
    label: 'Passed',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
  {
    id: 'e10-11',
    source: '10',
    target: '11',
    label: 'Signed',
    animated: true,
    style: { strokeDasharray: '5 5' },
    type: 'positionableedge',
    data: { type: 'smoothstep', positionHandlers: [] },
  },
];

export function FlowEditor() {
  // Initialize nodes and edges with our predefined city council workflow
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeLabel, setEdgeLabel] = useState<string>('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [nodeLabel, setNodeLabel] = useState<string>('');
  const [isEditingNode, setIsEditingNode] = useState(false);
  // Add state for interactive mode
  const [isInteractive, setIsInteractive] = useState<boolean>(true);

  // Handle interactive mode changes
  const handleInteractiveChange = useCallback((interactiveState: boolean) => {
    setIsInteractive(interactiveState);

    // Clear selections when locking the editor
    if (!interactiveState) {
      setSelectedNodes([]);
      setSelectedEdge(null);
      setIsEditingNode(false);
    }
  }, []);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeDasharray: '5 5' },
            type: 'positionableedge',
            data: { type: 'smoothstep', positionHandlers: [] },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event: NodeMouseHandler, node: Node) => {
      if (!isInteractive) return; // Prevent selection when not interactive

      // Clear any selected edge when selecting a node
      setSelectedEdge(null);

      if (multiSelectMode) {
        // In multi-select mode, toggle the node selection
        setSelectedNodes(prev => {
          const isSelected = prev.some(n => n.id === node.id);
          if (isSelected) {
            return prev.filter(n => n.id !== node.id);
          } else {
            return [...prev, node];
          }
        });
      } else {
        // In single-select mode, just select this node
        setSelectedNodes([node]);
        setNodeLabel((node.data.label as string) || '');
        setIsEditingNode(false);
      }
    },
    [multiSelectMode, isInteractive]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (event: EdgeMouseHandler, edge: Edge) => {
      if (!isInteractive) return; // Prevent selection when not interactive

      // Clear any selected nodes when selecting an edge
      setSelectedNodes([]);
      setSelectedEdge(edge);
      setEdgeLabel(edge.label || '');
    },
    [isInteractive]
  );

  // Update edge label
  const updateEdgeLabel = useCallback(() => {
    if (!selectedEdge) return;

    setEdges(eds =>
      eds.map(e => {
        if (e.id === selectedEdge.id) {
          return { ...e, label: edgeLabel };
        }
        return e;
      })
    );
  }, [selectedEdge, edgeLabel, setEdges]);

  // Toggle multi-select mode
  const toggleMultiSelectMode = useCallback(() => {
    setMultiSelectMode(prev => !prev);
    if (!multiSelectMode) {
      // Clear selection when entering multi-select mode
      setSelectedNodes([]);
    }
  }, [multiSelectMode]);

  // Create a group from selected nodes
  const createGroup = useCallback(() => {
    if (selectedNodes.length < 2) return;

    // Find boundaries of selected nodes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    selectedNodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + ((node.style?.width as number) || 180));
      maxY = Math.max(maxY, node.position.y + 50); // Assuming height of about 50px
    });

    // Add padding
    const padding = 30;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Create group node
    const groupId = `group-${Date.now()}`;
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: minX, y: minY },
      style: {
        width: maxX - minX,
        height: maxY - minY,
        backgroundColor: 'rgba(240, 240, 240, 0.7)',
        border: '1px dashed #aaa',
        borderRadius: 8,
        padding: 10,
        zIndex: -1,
      },
      data: { label: `Group ${nodes.length + 1}` },
    };

    // Update child nodes to reference the group
    const updatedNodes = nodes.map(node => {
      if (selectedNodes.some(n => n.id === node.id)) {
        // Create a new style object with the correct property name and type
        const newStyle = { ...node.style };
        // Don't attempt to set backgroundColor, keep using background property
        // This avoids the type conflict

        return {
          ...node,
          parentId: groupId,
          extent: 'parent' as const,
          position: {
            x: node.position.x - minX,
            y: node.position.y - minY,
          },
          // Keep the original style properties without modifying them
          style: newStyle,
        };
      }
      return node;
    });

    // Add the group node and update child nodes
    setNodes([groupNode, ...updatedNodes]);
    setSelectedNodes([]);
    setMultiSelectMode(false);
  }, [nodes, selectedNodes, setNodes]);

  // Ungroup nodes from a selected group
  const ungroupNodes = useCallback(() => {
    if (selectedNodes.length !== 1 || selectedNodes[0].type !== 'group') return;

    const groupNode = selectedNodes[0];
    const groupId = groupNode.id;
    const groupPosition = groupNode.position;

    // Find all child nodes of this group
    //const childNodes = nodes.filter(node => node.parentId === groupId);

    // Update nodes: remove the group and update child nodes
    const updatedNodes = nodes
      .filter(node => node.id !== groupId) // Remove the group node
      .map(node => {
        if (node.parentId === groupId) {
          // Reposition child nodes to absolute coordinates
          return {
            ...node,
            parentId: undefined,
            extent: undefined,
            position: {
              x: node.position.x + groupPosition.x,
              y: node.position.y + groupPosition.y,
            },
          };
        }
        return node;
      });

    setNodes(updatedNodes);
    setSelectedNodes([]);
  }, [nodes, selectedNodes, setNodes]);

  // Add a new proposal node
  const addProposalNode = useCallback(() => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      data: { label: `New Proposal ${newId}` },
      style: { background: '#bbdefb', padding: 10, borderRadius: 5, width: 180 },
      position: { x: 100, y: 100 },
    };
    setNodes(nds => nds.concat(newNode));
  }, [nodes, setNodes]);

  // Reset workflow to initial state
  const resetWorkflow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodes([]);
  }, [setNodes, setEdges]);

  // Start editing node
  const startEditingNode = useCallback(() => {
    if (selectedNodes.length !== 1) return;
    setIsEditingNode(true);
  }, [selectedNodes]);

  // Cancel editing node
  const cancelEditNode = useCallback(() => {
    if (selectedNodes.length !== 1) return;
    setIsEditingNode(false);
    setNodeLabel((selectedNodes[0].data.label as string) || '');
  }, [selectedNodes]);

  // Update node properties
  const updateNodeProperties = useCallback(() => {
    if (selectedNodes.length !== 1 || !isEditingNode) return;

    const selectedNode = selectedNodes[0];

    setNodes(nds =>
      nds.map(node => {
        if (node.id === selectedNode.id) {
          // Create a new data object with the updated label
          const newData = { ...node.data, label: nodeLabel };
          return { ...node, data: newData };
        }
        return node;
      })
    );

    setIsEditingNode(false);
  }, [selectedNodes, nodeLabel, isEditingNode, setNodes]);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    // Get IDs of nodes to delete
    let nodeIdsToDelete = selectedNodes.map(node => node.id);

    // Also identify child nodes of any group that's being deleted
    selectedNodes.forEach(node => {
      if (node.type === 'group') {
        // Find all child nodes of this group
        const childNodeIds = nodes.filter(n => n.parentId === node.id).map(n => n.id);

        // Add child node IDs to the deletion list
        nodeIdsToDelete = [...nodeIdsToDelete, ...childNodeIds];
      }
    });

    // Filter out the selected nodes and their children
    const updatedNodes = nodes.filter(node => !nodeIdsToDelete.includes(node.id));

    // Also remove edges connected to deleted nodes
    const updatedEdges = edges.filter(
      edge => !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
    );

    // Update state
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNodes([]);
  }, [nodes, edges, selectedNodes, setNodes, setEdges]);

  // Delete selected edge
  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdge) return;

    // Filter out the selected edge
    const updatedEdges = edges.filter(edge => edge.id !== selectedEdge.id);

    // Update state
    setEdges(updatedEdges);
    setSelectedEdge(null);
  }, [selectedEdge, edges, setEdges]);

  // Reset edge state
  const resetEdgeState = useCallback(() => {
    if (!selectedEdge) return;

    setEdges(eds =>
      eds.map(e => {
        if (e.id === selectedEdge.id) {
          // Reset position handlers
          const newData = { ...e.data, positionHandlers: [] };
          return { ...e, data: newData };
        }
        return e;
      })
    );
  }, [selectedEdge, setEdges]);

  return (
    <div className="h-screen w-full">
      {' '}
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          // Highlight selected nodes
          style: {
            ...node.style,
            boxShadow: selectedNodes.some(n => n.id === node.id) ? '0 0 0 2px #ff0072' : undefined,
          },
        }))}
        edges={edges.map(edge => ({
          ...edge,
          // Highlight selected edge
          style: {
            ...edge.style,
            stroke: selectedEdge?.id === edge.id ? '#ff0072' : undefined,
            strokeWidth: selectedEdge?.id === edge.id ? 3 : undefined,
          },
        }))}
        nodesDraggable={isInteractive}
        nodesFocusable={isInteractive}
        nodesConnectable={isInteractive}
        edgesFocusable={isInteractive}
        edgesUpdatable={isInteractive}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onNodesChange={isInteractive ? onNodesChange : undefined}
        onEdgesChange={isInteractive ? onEdgesChange : undefined}
        onConnect={isInteractive ? onConnect : undefined}
        // @ts-expect-error ReactFlow's onNodeClick expects different parameter types than what we're providing with our custom handler implementation
        onNodeClick={onNodeClick}
        // @ts-expect-error ReactFlow's onEdgeClick expects different parameter types than what we're providing with our custom handler implementation
        onEdgeClick={onEdgeClick}
        fitView
      >
        {/* Control panels */}
        <Panel position="top-left" className="rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-bold">City Council Workflow</h2>
          <p className="mb-3 text-sm text-gray-600">
            Interactive diagram showing the proposal lifecycle in city government
          </p>
          <div className="flex flex-wrap gap-2">
            {isInteractive && (
              <>
                <Button size="sm" onClick={addProposalNode}>
                  Add Proposal
                </Button>
                <Button
                  size="sm"
                  variant={multiSelectMode ? 'default' : 'outline'}
                  onClick={toggleMultiSelectMode}
                >
                  {multiSelectMode ? 'Multi-Select: ON' : 'Multi-Select: OFF'}
                </Button>
                {selectedNodes.length >= 2 && (
                  <Button size="sm" variant="secondary" onClick={createGroup}>
                    Group Selected ({selectedNodes.length})
                  </Button>
                )}
                {selectedNodes.length === 1 && selectedNodes[0].type === 'group' && (
                  <Button size="sm" variant="secondary" onClick={ungroupNodes}>
                    Ungroup
                  </Button>
                )}
                {selectedNodes.length > 0 && (
                  <Button size="sm" variant="destructive" onClick={deleteSelectedNodes}>
                    Delete Selected
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={resetWorkflow}>
                  Reset
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant={isInteractive ? 'outline' : 'default'}
              onClick={() => setIsInteractive(!isInteractive)}
            >
              {isInteractive ? 'Lock Editor' : 'Unlock Editor'}
            </Button>
          </div>
        </Panel>

        {/* Information panel for selected node - only show when interactive */}
        {isInteractive && selectedNodes.length === 1 && (
          <Panel position="top-right" className="w-80 rounded bg-white p-4 shadow">
            {isEditingNode ? (
              <div className="space-y-2">
                <h3 className="text-md mb-2 font-bold">Edit Node</h3>
                <Label htmlFor="nodeLabel">Label</Label>
                <Input
                  id="nodeLabel"
                  value={nodeLabel}
                  onChange={e => setNodeLabel(e.target.value)}
                  placeholder="Enter node label"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={updateNodeProperties}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditNode}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-md font-bold">{selectedNodes[0].data.label as string}</h3>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={startEditingNode}>
                    Edit Node
                  </Button>
                  <Button size="sm" variant="destructive" onClick={deleteSelectedNodes}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        )}

        {/* Edge label editor panel - only show when interactive */}
        {isInteractive && selectedEdge && (
          <Panel position="top-right" className="w-80 rounded bg-white p-4 shadow">
            <h3 className="text-md mb-2 font-bold">Edit Edge Label</h3>
            <p>Double click an edge to edit edge path.</p>
            <div className="space-y-2">
              <Label htmlFor="edgeLabel">Label</Label>
              <Input
                id="edgeLabel"
                value={edgeLabel}
                onChange={e => setEdgeLabel(e.target.value)}
                placeholder="Enter edge label"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={updateEdgeLabel}>
                  Update Label
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedEdge(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteSelectedEdge}>
                  Delete Edge
                </Button>
                <Button size="sm" variant="outline" onClick={resetEdgeState}>
                  Reset Edge Path
                </Button>
              </div>
            </div>
          </Panel>
        )}

        <Controls onInteractiveChange={handleInteractiveChange} />
        <MiniMap zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
