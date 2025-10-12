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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type WheelEvent as ReactWheelEvent
} from 'react';
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
  const {
    screenToFlowPosition,
    toObject,
    zoomIn,
    zoomOut,
    fitView,
    getZoom,
    setViewport,
    getViewport
  } = useReactFlow<Node<ScreepsNodeData>, Edge>();
  const [zoomDisplay, setZoomDisplay] = useState('100%');
  const [snapToGrid, setSnapToGrid] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ScreepsNodeData>>(graph.nodes as Node<ScreepsNodeData>[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

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
        color: '#5a6169',
        width: 14,
        height: 14
      },
      style: {
        stroke: '#5a6169',
        strokeWidth: 1.5
      }
    }),
    []
  );

  const updateZoomDisplay = useCallback(() => {
    setTimeout(() => {
      setZoomDisplay(`${Math.round((getZoom() ?? 1) * 100)}%`);
    }, 0);
  }, [getZoom]);

  const normaliseWheelDelta = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    const nativeEvent = event.nativeEvent;
    let delta = nativeEvent.deltaY;

    if (nativeEvent.deltaMode === 1) {
      delta *= 16;
    } else if (nativeEvent.deltaMode === 2) {
      delta *= 100;
    }

    if (delta === 0 && nativeEvent.deltaX !== 0) {
      delta = nativeEvent.deltaX;
    }

    return delta;
  }, []);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!showFlow) {
        return;
      }

      const delta = normaliseWheelDelta(event);

      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        const viewport = getViewport();
        setViewport({
          x: viewport.x - delta * 0.6,
          y: viewport.y,
          zoom: viewport.zoom
        });
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        const viewport = getViewport();
        setViewport({
          x: viewport.x,
          y: viewport.y - delta * 0.6,
          zoom: viewport.zoom
        });
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (delta < 0) {
        zoomIn({ duration: 0 });
      } else {
        zoomOut({ duration: 0 });
      }

      updateZoomDisplay();
    },
    [getViewport, normaliseWheelDelta, setViewport, showFlow, updateZoomDisplay, zoomIn, zoomOut]
  );

  useEffect(() => {
    updateZoomDisplay();
  }, [updateZoomDisplay]);

  useEffect(() => {
    if (!showFlow) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      const selectedNodes = nodesRef.current.filter((node) => node.selected);
      const selectedEdges = edgesRef.current.filter((edge) => edge.selected);

      if (selectedNodes.length === 0 && selectedEdges.length === 0) {
        return;
      }

      event.preventDefault();

      setNodes((current) => current.filter((node) => !node.selected));
      setEdges((current) => current.filter((edge) => !edge.selected));
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setEdges, setNodes, showFlow]);

  return (
    <div
      ref={wrapperRef}
      className="canvas-surface"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onWheel={handleWheel}
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
          snapToGrid={snapToGrid}
          snapGrid={[32, 32]}
          selectionOnDrag={false}
          zoomOnScroll={false}
          panOnScroll={false}
          className="neo-flow"
          onMoveEnd={updateZoomDisplay}
        >
          <Background gap={32} color="#1c1d1f" lineWidth={1} />
        </ReactFlow>
      ) : (
        emptyState
      )}
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-status">
          <span className="status-indicator" aria-hidden />
          <span className="status-label">Workflow</span>
        </div>
        <div className="canvas-toolbar-controls">
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              zoomOut();
              updateZoomDisplay();
            }}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="toolbar-readout">{zoomDisplay}</span>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              zoomIn();
              updateZoomDisplay();
            }}
            aria-label="Zoom in"
          >
            ＋
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => {
              fitView({ padding: 0.12 });
              updateZoomDisplay();
            }}
          >
            Fit
          </button>
        </div>
        <div className="canvas-toolbar-meta">
          <span className="meta-pill">Auto-sync</span>
          <button
            type="button"
            className={`meta-pill toggle ${snapToGrid ? 'active' : ''}`}
            onClick={() => setSnapToGrid((prev) => !prev)}
          >
            {snapToGrid ? 'Snap grid: On' : 'Snap grid: Off'}
          </button>
        </div>
      </div>
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
