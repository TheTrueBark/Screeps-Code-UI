import {
  Background,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowJsonObject
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useRef, type DragEvent } from 'react';
import type { GraphNodeData, GraphState } from '@shared/types';
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
  const registerGraphSerializer = useFileStore((state) => state.registerGraphSerializer);
  const { screenToFlowPosition, toObject } = useReactFlow<Node<ScreepsNodeData>, Edge>();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ScreepsNodeData>>(graph.nodes as Node<ScreepsNodeData>[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    registerGraphSerializer(() => {
      const snapshot = toObject() as ReactFlowJsonObject<Node<ScreepsNodeData>, Edge> | null;
      if (!snapshot) {
        return null;
      }

      return {
        nodes: snapshot.nodes.map((node) => ({
          id: node.id,
          type: node.type ?? '',
          position: node.position,
          data: (node.data ?? {}) as GraphNodeData
        })),
        edges: snapshot.edges.map((edge) => ({
          id: edge.id ?? nanoid(),
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle ?? null,
          targetHandle: edge.targetHandle ?? null
        }))
      } satisfies GraphState;
    });

    return () => {
      registerGraphSerializer(null);
    };
  }, [registerGraphSerializer, toObject]);

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

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#00c8ff',
        width: 14,
        height: 14
      },
      style: {
        stroke: '#00c8ff',
        strokeWidth: 1
      }
    }),
    []
  );

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
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          panOnDrag={[1, 2]}
          className="neo-flow"
        >
          <Background gap={32} color="#0a0f12" lineWidth={1} />
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
