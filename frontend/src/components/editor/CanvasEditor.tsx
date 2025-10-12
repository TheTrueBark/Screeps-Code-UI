import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useOnViewportChange,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowJsonObject,
  type Viewport
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
import type { GraphState } from '@shared/types';
import { useFileStore, GRAPH_STATE_VERSION } from '../../state/fileStore';
import { getDocMarkdown, getNodeMeta } from '../../data/nodeRegistry';
import type { ScreepsNodeData } from './NodeTypes/BaseNode';
import type { NodeDefinition } from './NodeTypes/types';
import { NODE_DEFINITION_MAP, NODE_TYPE_MAP } from './nodeRegistry';
import { NodeContextBar } from './NodeContextBar';
import { NodeHelpPopover } from './NodeHelpPopover';
import { FloatingCatalog } from './FloatingCatalog';

const nodeTypes = NODE_TYPE_MAP;
const GRID_SIZE = 24;
const SNAP_GRID: [number, number] = [GRID_SIZE, GRID_SIZE];
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 } as const;

const snapValue = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const snapPosition = (position: { x: number; y: number }) => ({
  x: snapValue(position.x),
  y: snapValue(position.y)
});

const normalizeNodes = (nodes: GraphState['xyflow']['nodes']): Node<ScreepsNodeData>[] =>
  nodes.map((node) => ({
    ...node,
    type: node.type ?? NODE_DEFINITION_MAP[(node.data as ScreepsNodeData | undefined)?.kind ?? '']?.type ?? node.type ?? '',
    data: (node.data ?? {}) as ScreepsNodeData
  })) as Node<ScreepsNodeData>[];

const normalizeEdges = (edges: GraphState['xyflow']['edges']): Edge[] =>
  edges.map((edge) => ({
    ...edge,
    id: edge.id ?? nanoid(),
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined
  }));

const instantiateNode = (
  definition: NodeDefinition,
  position: { x: number; y: number }
): Node<ScreepsNodeData> => ({
  id: `${definition.type}-${nanoid(6)}`,
  type: definition.type,
  position,
  data: {
    kind: definition.kind,
    label: definition.title,
    family: definition.family,
    config: JSON.parse(JSON.stringify(definition.defaultConfig ?? {}))
  }
});

const getInputLabel = (definition: NodeDefinition | undefined, handleId: string) =>
  definition?.dataInputs?.find((input) => input.handleId === handleId)?.label;

const getOutputLabel = (definition: NodeDefinition | undefined, handleId: string) => {
  if (!definition) {
    return undefined;
  }

  if (handleId.startsWith('slot:')) {
    const slot = definition.slots?.find((entry) => `slot:${entry.name}` === handleId);
    return slot?.label;
  }

  return definition.dataOutputs?.find((output) => output.handleId === handleId)?.label;
};

const buildGraphStateFromSnapshot = (
  snapshot: ReactFlowJsonObject<Node<ScreepsNodeData>, Edge>
): GraphState => ({
  version: GRAPH_STATE_VERSION,
  xyflow: {
    nodes: snapshot.nodes ?? [],
    edges: snapshot.edges ?? [],
    viewport: snapshot.viewport ?? { ...DEFAULT_VIEWPORT }
  },
  updatedAt: Date.now()
});

const CanvasEditorInner = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHydratingRef = useRef(false);
  const localSaveTimer = useRef<number | null>(null);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getGraphState = useFileStore((state) => state.getGraphState);
  const saveActiveGraph = useFileStore((state) => state.saveActiveGraph);
  const registerGraphSerializer = useFileStore((state) => state.registerGraphSerializer);
  const flushPendingSaves = useFileStore((state) => state.flushPendingSaves);
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

  const [nodes, setNodes, applyNodeChanges] = useNodesState<Node<ScreepsNodeData>>([]);
  const [edges, setEdges, applyEdgeChanges] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextPosition, setContextPosition] = useState<{ x: number; y: number } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogPinned, setCatalogPinned] = useState(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  const scheduleGraphSave = useCallback(
    (immediate = false) => {
      if (!activeFileId) {
        return;
      }

      if (!immediate && isHydratingRef.current) {
        return;
      }

      const run = () => {
        const snapshot = toObject() as ReactFlowJsonObject<Node<ScreepsNodeData>, Edge>;
        const graphState = buildGraphStateFromSnapshot(snapshot);
        saveActiveGraph(graphState, immediate ? { immediate: true } : undefined);
      };

      if (immediate) {
        if (localSaveTimer.current) {
          window.clearTimeout(localSaveTimer.current);
          localSaveTimer.current = null;
        }
        run();
        return;
      }

      if (localSaveTimer.current) {
        window.clearTimeout(localSaveTimer.current);
      }

      localSaveTimer.current = window.setTimeout(() => {
        localSaveTimer.current = null;
        run();
      }, 220);
    },
    [activeFileId, saveActiveGraph, toObject]
  );

  const spawnNode = useCallback(
    (definition: NodeDefinition, position: { x: number; y: number }) => {
      setNodes((current) => [...current, instantiateNode(definition, position)]);
      scheduleGraphSave();
    },
    [scheduleGraphSave, setNodes]
  );

  const updateContextPosition = useCallback(() => {
    if (!selectedNodeId) {
      setContextPosition(null);
      return;
    }

    const element = document.querySelector<HTMLElement>(`[data-node-id="${selectedNodeId}"]`);
    if (!element) {
      setContextPosition(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setContextPosition({ x: rect.right + 12, y: rect.bottom + 8 });
  }, [selectedNodeId]);

  const handleCatalogSpawn = useCallback(
    (kind: string) => {
      const definition = NODE_DEFINITION_MAP[kind];
      if (!definition) {
        return;
      }

      const bounds = wrapperRef.current?.getBoundingClientRect();
      let { x, y } = pointerRef.current;
      if (bounds) {
        x = Math.min(Math.max(x, bounds.left + 12), bounds.right - 12);
        y = Math.min(Math.max(y, bounds.top + 12), bounds.bottom - 12);
      }

      const position = snapPosition(screenToFlowPosition({ x, y }));
      spawnNode(definition, position);
    },
    [screenToFlowPosition, spawnNode]
  );

  const applyPortPreview = useCallback(
    (
      targetId: string | null | undefined,
      targetHandle: string | null | undefined,
      sourceId: string | null | undefined,
      sourceHandle: string | null | undefined
    ) => {
      if (!targetId || !targetHandle || !sourceId || !sourceHandle) {
        return;
      }

      const sourceNode = nodesRef.current.find((node) => node.id === sourceId);
      const targetNode = nodesRef.current.find((node) => node.id === targetId);
      if (!sourceNode || !targetNode) {
        return;
      }

      const sourceDefinition = NODE_DEFINITION_MAP[(sourceNode.data as ScreepsNodeData).kind];
      const targetDefinition = NODE_DEFINITION_MAP[(targetNode.data as ScreepsNodeData).kind];
      const previewLabel =
        getOutputLabel(sourceDefinition, sourceHandle) ??
        getInputLabel(targetDefinition, targetHandle) ??
        sourceHandle;

      setNodes((current) =>
        current.map((node) => {
          if (node.id !== targetId) {
            return node;
          }

          const currentData = (node.data as ScreepsNodeData) ?? {
            kind: '',
            label: '',
            family: 'flow',
            config: {}
          };

          const previews = { ...(currentData.portPreviews ?? {}) };
          previews[targetHandle] = previewLabel;

          return {
            ...node,
            data: {
              ...currentData,
              portPreviews: previews
            }
          };
        })
      );
    },
    [setNodes]
  );

  const clearPortPreview = useCallback(
    (targetId: string | null | undefined, targetHandle: string | null | undefined) => {
      if (!targetId || !targetHandle) {
        return;
      }

      setNodes((current) =>
        current.map((node) => {
          if (node.id !== targetId) {
            return node;
          }

          const currentData = (node.data as ScreepsNodeData) ?? {
            kind: '',
            label: '',
            family: 'flow',
            config: {}
          };

          if (!currentData.portPreviews?.[targetHandle]) {
            return node;
          }

          const previews = { ...(currentData.portPreviews ?? {}) };
          delete previews[targetHandle];

          return {
            ...node,
            data: {
              ...currentData,
              portPreviews: previews
            }
          };
        })
      );
    },
    [setNodes]
  );

  const handleSelectionChange = useCallback(
    (params: { nodes: Node<ScreepsNodeData>[] }) => {
      const first = params?.nodes?.[0];
      setSelectedNodeId(first ? first.id : null);
    },
    []
  );

  const handleToggleNodeDisabled = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNodeId) {
          return node;
        }

        const currentData = (node.data as ScreepsNodeData) ?? {
          kind: '',
          label: '',
          family: 'flow',
          config: {}
        };

        return {
          ...node,
          data: {
            ...currentData,
            disabled: !currentData.disabled
          }
        };
      })
    );
    scheduleGraphSave();
  }, [scheduleGraphSave, selectedNodeId, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
    scheduleGraphSave();
  }, [scheduleGraphSave, selectedNodeId, setEdges, setNodes]);

  const handleCloseSelection = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) => (node.id === selectedNodeId ? { ...node, selected: false } : node))
    );
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes]);

  const handleCatalogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && catalogPinned) {
        setCatalogPinned(false);
      }
      setCatalogOpen(nextOpen);
    },
    [catalogPinned]
  );

  const handleCatalogPinChange = useCallback((nextPinned: boolean) => {
    setCatalogPinned(nextPinned);
    if (nextPinned) {
      setCatalogOpen(true);
    }
  }, []);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    updateContextPosition();
  }, [nodes, selectedNodeId, updateContextPosition]);

  useEffect(() => {
    setHelpOpen(false);
  }, [selectedNodeId]);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const handleResize = () => {
      if (!wrapperRef.current) {
        return;
      }
      const rect = wrapperRef.current.getBoundingClientRect();
      pointerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      updateContextPosition();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateContextPosition]);

  useEffect(() => {
    if (catalogOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      pointerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }, [catalogOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();

      if (catalogPinned) {
        setCatalogPinned(false);
        setCatalogOpen(false);
        return;
      }

      setCatalogOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [catalogPinned]);

  useOnViewportChange({
    onChange: () => updateContextPosition(),
    onEnd: () => updateContextPosition()
  });

  useEffect(() => () => {
    if (localSaveTimer.current) {
      window.clearTimeout(localSaveTimer.current);
    }
  }, []);

  useEffect(() => {
    registerGraphSerializer(() => {
      try {
        const snapshot = toObject() as ReactFlowJsonObject<Node<ScreepsNodeData>, Edge>;
        return buildGraphStateFromSnapshot(snapshot);
      } catch (error) {
        console.warn('Failed to serialise graph', error);
        return null;
      }
    });

    return () => {
      registerGraphSerializer(null);
    };
  }, [registerGraphSerializer, toObject]);

  useEffect(() => {
    if (!activeFileId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const graph = getGraphState(activeFileId);
    if (!graph) {
      setNodes([]);
      setEdges([]);
      setViewport({ ...DEFAULT_VIEWPORT }, { duration: 0 });
      return;
    }

    isHydratingRef.current = true;
    const nextNodes = normalizeNodes(graph.xyflow.nodes);
    const nextEdges = normalizeEdges(graph.xyflow.edges);
    setNodes(nextNodes);
    setEdges(nextEdges);

    const viewport = graph.xyflow.viewport ?? DEFAULT_VIEWPORT;
    setViewport({ ...viewport }, { duration: 0 });
    setTimeout(() => {
      isHydratingRef.current = false;
      setZoomDisplay(`${Math.round((getZoom() ?? 1) * 100)}%`);
    }, 0);
  }, [activeFileId, getGraphState, getZoom, setEdges, setNodes, setViewport]);

  const onConnect = useCallback(
    (connection: Connection | Edge) => {
      setEdges((eds) => addEdge(connection, eds));
      applyPortPreview(connection.target, connection.targetHandle, connection.source, connection.sourceHandle);
      scheduleGraphSave();
    },
    [applyPortPreview, scheduleGraphSave, setEdges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<ScreepsNodeData>>[]) => {
      applyNodeChanges(changes);
      scheduleGraphSave();
    },
    [applyNodeChanges, scheduleGraphSave]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      applyEdgeChanges(changes);

      changes
        .filter((change) => change.type === 'remove')
        .forEach((change) => {
          const edge = edgesRef.current.find((entry) => entry.id === change.id);
          if (edge) {
            clearPortPreview(edge.target, edge.targetHandle);
          }
        });

      scheduleGraphSave();
    },
    [applyEdgeChanges, clearPortPreview, scheduleGraphSave]
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

      const position = snapPosition(
        screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        })
      );

      spawnNode(definition, position);
    },
    [activeFileId, screenToFlowPosition, spawnNode]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
      if (!activeFileId) {
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
        scheduleGraphSave();
        return;
      }

      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        const viewport = getViewport();
        setViewport({
          x: viewport.x,
          y: viewport.y - delta * 0.7,
          zoom: viewport.zoom
        });
        scheduleGraphSave();
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
      scheduleGraphSave();
    },
    [activeFileId, getViewport, normaliseWheelDelta, scheduleGraphSave, setViewport, updateZoomDisplay, zoomIn, zoomOut]
  );

  useEffect(() => {
    updateZoomDisplay();
  }, [updateZoomDisplay]);

  useEffect(() => {
    if (!activeFileId) {
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
      scheduleGraphSave();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFileId, scheduleGraphSave, setEdges, setNodes]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      scheduleGraphSave(true);
      flushPendingSaves();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushPendingSaves, scheduleGraphSave]);

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

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );
  const selectedMeta = selectedNode
    ? getNodeMeta((selectedNode.data as ScreepsNodeData).kind)
    : undefined;

  const helpMarkdown = useMemo(() => {
    if (!selectedMeta) {
      return '';
    }
    return getDocMarkdown(selectedMeta.kind);
  }, [selectedMeta]);

  const isCatalogActive = catalogPinned || catalogOpen;
  const helpAnchor = contextPosition
    ? { x: contextPosition.x, y: contextPosition.y + 56 }
    : null;

  return (
    <div
      ref={wrapperRef}
      className="canvas-surface"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onWheel={handleWheel}
      onMouseMove={(event) => {
        pointerRef.current = { x: event.clientX, y: event.clientY };
      }}
      onMouseLeave={() => {
        if (!wrapperRef.current) {
          return;
        }
        const rect = wrapperRef.current.getBoundingClientRect();
        pointerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }}
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
          snapToGrid
          snapGrid={SNAP_GRID}
          selectionOnDrag={false}
          zoomOnScroll={false}
          panOnScroll={false}
          className="neo-flow"
          onSelectionChange={handleSelectionChange as any}
          onMoveEnd={() => {
            updateZoomDisplay();
            scheduleGraphSave();
          }}
          onViewportChange={(_viewport: Viewport) => {
            scheduleGraphSave();
          }}
          onNodeDragStop={(_, node) => {
            setNodes((current) =>
              current.map((existing) =>
                existing.id === node.id
                  ? {
                      ...existing,
                      position: snapPosition(node.position)
                    }
                  : existing
              )
            );
            scheduleGraphSave();
          }}
          onPaneMouseMove={(event) => {
            pointerRef.current = { x: event.clientX, y: event.clientY };
          }}
        >
          <Background gap={GRID_SIZE} color="#1c1d1f" lineWidth={1} variant={BackgroundVariant.Lines} />
        </ReactFlow>
      ) : (
        emptyState
      )}
      <FloatingCatalog
        open={isCatalogActive}
        pinned={catalogPinned}
        onOpenChange={handleCatalogOpenChange}
        onPinChange={handleCatalogPinChange}
        onSpawn={handleCatalogSpawn}
        selectedMeta={selectedMeta}
        onSelectedHelp={() => setHelpOpen(true)}
      />
      <NodeContextBar
        position={contextPosition}
        visible={Boolean(selectedNodeId)}
        paused={Boolean((selectedNode?.data as ScreepsNodeData | undefined)?.disabled)}
        pinned={catalogPinned}
        onPause={handleToggleNodeDisabled}
        onPinToggle={() => handleCatalogPinChange(!catalogPinned)}
        onHelp={() => setHelpOpen((prev) => !prev)}
        onDelete={handleDeleteNode}
        onClose={handleCloseSelection}
      />
      <NodeHelpPopover
        open={helpOpen && Boolean(selectedMeta)}
        anchor={helpAnchor}
        title={selectedMeta?.title ?? ''}
        markdown={helpMarkdown}
        onClose={() => setHelpOpen(false)}
      />
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
              zoomOut({ duration: 0 });
              updateZoomDisplay();
              scheduleGraphSave();
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
              zoomIn({ duration: 0 });
              updateZoomDisplay();
              scheduleGraphSave();
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
              scheduleGraphSave();
            }}
          >
            Fit
          </button>
        </div>
        <div className="canvas-toolbar-meta">
          <span className="meta-pill">Auto-sync</span>
          <span className="meta-pill muted">Snap grid: 24px</span>
        </div>
      </div>
    </div>
  );
};

export const CanvasEditor = () => (
  <ReactFlowProvider>
    <CanvasEditorInner />
  </ReactFlowProvider>
);
