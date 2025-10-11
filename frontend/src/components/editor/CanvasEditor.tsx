import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useRef, type DragEvent } from 'react';
import { useFileStore } from '../../state/fileStore';
import { useNodeStore } from '../../state/nodeStore';
import type { ScreepsNodeData } from './NodeTypes/BaseNode';
import { NODE_DEFINITION_MAP, NODE_TYPE_MAP } from './nodeRegistry';

const nodeTypes = NODE_TYPE_MAP;

const CanvasEditorInner = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const initializeGraph = useNodeStore((state) => state.initializeGraphForFile);
  const setGraphState = useNodeStore((state) => state.setGraphState);
  const graph = useNodeStore((state) => state.getGraphForFile(activeFileId));
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ScreepsNodeData>>(graph.nodes as Node<ScreepsNodeData>[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    if (!activeFileId) {
      return;
    }

    initializeGraph(activeFileId);
  }, [activeFileId, initializeGraph]);

  useEffect(() => {
    setNodes(graph.nodes as Node<ScreepsNodeData>[]);
    setEdges(graph.edges);
  }, [graph.nodes, graph.edges, setEdges, setNodes]);

  useEffect(() => {
    if (!activeFileId) {
      return;
    }

    setGraphState(activeFileId, nodes as Node<ScreepsNodeData>[], edges);
  }, [activeFileId, edges, nodes, setGraphState]);

  const onConnect = useCallback(
    (connection: Connection | Edge) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!activeFileId) {
        return;
      }

      const nodeKind = event.dataTransfer.getData('application/screeps-node-kind');
      const definition = NODE_DEFINITION_MAP[nodeKind];
      if (!definition) {
        return;
      }

      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (
        !bounds ||
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode: Node<ScreepsNodeData> = {
        id: `${definition.type}-${nanoid(6)}`,
        type: definition.type,
        position,
        data: {
          kind: definition.kind,
          label: definition.title,
          family: definition.family,
          config: JSON.parse(JSON.stringify(definition.defaultConfig ?? {}))
        }
      };

      setNodes((current) => [...current, newNode]);
    },
    [activeFileId, screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const emptyState = useMemo(
    () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Select a file from the tree to start designing a workflow.
      </div>
    ),
    []
  );

  const showFlow = Boolean(activeFileId);

  return (
    <div
      ref={wrapperRef}
      className="canvas-surface"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {showFlow ? (
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
          <Background gap={20} color="#2a2a2a" />
          <MiniMap pannable zoomable className="minimap" />
          <Controls className="controls" />
        </ReactFlow>
      ) : (
        emptyState
      )}
    </div>
  );
};

/**
 * Wrapper component that provides the ReactFlow context and keeps the canvas
 * synchronized with the Zustand stores.
 */
export const CanvasEditor = () => (
  <ReactFlowProvider>
    <CanvasEditorInner />
  </ReactFlowProvider>
);
