import { memo, useCallback, useEffect } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  type Edge,
  type NodeTypes,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../store/graphStore';
import { IfNode, type IfNodeType } from './nodes/IfNode';
import { ActionNode, type ActionNodeType } from './nodes/ActionNode';

type ScreepsNode = IfNodeType | ActionNodeType;

/**
 * Zentraler Wrapper für den Xyflow-Canvas. Bindet benutzerdefinierte Nodes ein,
 * synchronisiert den Graph-State mit dem Zustandsspeicher und bietet Komfortfeatures
 * wie Minimap, Zoom und Hintergrundraster.
 */
const nodeTypes: NodeTypes = {
  if: IfNode,
  action: ActionNode
};

const initialNodes: ScreepsNode[] = [
  {
    id: 'if-node',
    type: 'if',
    position: { x: 0, y: 0 },
    data: {
      label: 'Check energy > 50'
    }
  },
  {
    id: 'action-node',
    type: 'action',
    position: { x: 250, y: 100 },
    data: {
      label: 'Harvest Source'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'if-to-action',
    source: 'if-node',
    target: 'action-node',
    sourceHandle: 'true'
  }
];

const FlowCanvasInner = memo(() => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const setGraphElements = useGraphStore((state) => state.setElements);

  useEffect(() => {
    setGraphElements(nodes, edges);
  }, [nodes, edges, setGraphElements]);

  const onConnect = useCallback(
    (params: Edge | Parameters<typeof addEdge>[0]) =>
      setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-full min-h-[24rem] rounded-lg border border-slate-700 bg-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="text-slate-100"
      >
        <Background gap={16} color="#1e293b" />
        <MiniMap pannable zoomable className="bg-slate-900/80" />
        <Controls className="bg-slate-900/80" />
      </ReactFlow>
    </div>
  );
});
FlowCanvasInner.displayName = 'FlowCanvasInner';

export const FlowCanvas = () => (
  <ReactFlowProvider>
    <FlowCanvasInner />
  </ReactFlowProvider>
);
