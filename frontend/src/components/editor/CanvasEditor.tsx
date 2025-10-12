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
  type CSSProperties,
  type DragEvent,
  type WheelEvent as ReactWheelEvent
} from 'react';
import type { GraphState } from '@shared/types';
import { useFileStore, GRAPH_STATE_VERSION } from '../../state/fileStore';
import { getDocMarkdown, getNodeMeta } from '../../data/nodeRegistry';
import type { ScreepsNodeData } from './NodeTypes/BaseNode';
import type { NodeDefinition } from './NodeTypes/types';
import { NODE_DEFINITION_MAP, NODE_TYPE_MAP } from './nodeRegistry';
import { BottomMenu } from './BottomMenu';
import { NodeHelpPopover } from './NodeHelpPopover';
import { NodeToolbar } from './NodeToolbar';

const nodeTypes = NODE_TYPE_MAP;
const GRID_SIZE = 24;
const SNAP_GRID: [number, number] = [GRID_SIZE, GRID_SIZE];
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 } as const;
const ZOOM_STEP = 0.05;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

const snapValue = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const snapPosition = (position: { x: number; y: number }) => ({
  x: snapValue(position.x),
  y: snapValue(position.y)
});

const quantizeZoom = (value: number) => Math.round(value / ZOOM_STEP) * ZOOM_STEP;

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (val as Record<string, unknown>)[key];
          return acc;
        }, {});
    }
    return val;
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
  const [toolbarAnchor, setToolbarAnchor] = useState<DOMRect | null>(null);
  const [toolbarPlacement, setToolbarPlacement] = useState<'above' | 'below'>('below');
  const [zoomValue, setZoomValue] = useState(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFileId) {
      setActiveCategory(null);
    }
  }, [activeFileId]);
  const gridVisualGap = useMemo(() => Math.max(4, GRID_SIZE * zoomValue), [zoomValue]);

  const syncZoom = useCallback((value: number) => {
    const quantized = clampZoom(quantizeZoom(value));
    setZoomValue(quantized);
    setZoomDisplay(`${Math.round(quantized * 100)}%`);
    return quantized;
  }, []);
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

  const updateToolbarAnchor = useCallback(() => {
    if (!selectedNodeId) {
      setToolbarAnchor(null);
      return;
    }

    const element = document.querySelector<HTMLElement>(`[data-node-id="${selectedNodeId}"]`);
    if (!element) {
      setToolbarAnchor(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement = spaceBelow >= spaceAbove ? 'below' : 'above';

    setToolbarPlacement(placement);
    setToolbarAnchor(rect);
  }, [selectedNodeId]);

  const handleSpawnNode = useCallback(
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

  const handleCategoryToggle = useCallback((category: string) => {
    setActiveCategory((current) => (current === category ? null : category));
  }, []);

  const refreshZoom = useCallback(() => {
    const current = getZoom() ?? 1;
    syncZoom(current);
  }, [getZoom, syncZoom]);

  const applyZoomStep = useCallback(
    (direction: 1 | -1) => {
      if (direction > 0) {
        zoomIn({ duration: 0 });
      } else {
        zoomOut({ duration: 0 });
      }

      requestAnimationFrame(() => {
        const viewport = getViewport();
        const quantized = syncZoom(viewport.zoom ?? 1);
        if (Math.abs((viewport.zoom ?? 1) - quantized) > 0.0001) {
          setViewport({ ...viewport, zoom: quantized }, { duration: 0 });
        }
        scheduleGraphSave();
      });
    },
    [getViewport, scheduleGraphSave, setViewport, syncZoom, zoomIn, zoomOut]
  );

  const handleZoomReset = useCallback(() => {
    setViewport({ ...DEFAULT_VIEWPORT }, { duration: 0 });
    requestAnimationFrame(() => {
      refreshZoom();
      scheduleGraphSave();
    });
  }, [refreshZoom, scheduleGraphSave, setViewport]);

  const handleZoomFit = useCallback(() => {
    fitView({ padding: 0.12 });
    requestAnimationFrame(() => {
      refreshZoom();
      scheduleGraphSave();
    });
  }, [fitView, refreshZoom, scheduleGraphSave]);

  const handleToggleEdit = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) => {
        if (node.id !== selectedNodeId) {
          return node;
        }

        const data = (node.data as ScreepsNodeData) ?? {
          kind: '',
          label: '',
          family: 'flow',
          config: {}
        };

        return {
          ...node,
          data: {
            ...data,
            editing: !data.editing
          }
        };
      })
    );
    scheduleGraphSave();
  }, [scheduleGraphSave, selectedNodeId, setNodes]);

  const handleDuplicateNode = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    const source = nodesRef.current.find((entry) => entry.id === selectedNodeId);
    if (!source) {
      return;
    }

    const sourceData = (source.data as ScreepsNodeData) ?? {
      kind: '',
      label: '',
      family: 'flow',
      config: {}
    };

    const definition = NODE_DEFINITION_MAP[sourceData.kind];
    if (!definition) {
      return;
    }

    const offsetPosition = snapPosition({
      x: source.position.x + GRID_SIZE,
      y: source.position.y + GRID_SIZE
    });

    const clone = instantiateNode(definition, offsetPosition);
    clone.data = {
      ...JSON.parse(JSON.stringify(sourceData)),
      editing: false
    } as ScreepsNodeData;

    setNodes((current) => [...current, clone]);
    setSelectedNodeId(clone.id);
    scheduleGraphSave();
  }, [scheduleGraphSave, selectedNodeId, setNodes]);

  const handleToggleHelp = useCallback(() => {
    setHelpOpen((prev) => !prev);
  }, []);

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

  const deleteNodeById = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNodeId((current) => (current === nodeId ? null : current));
      setPendingDeleteId(null);
      scheduleGraphSave();
    },
    [scheduleGraphSave, setEdges, setNodes]
  );

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    updateToolbarAnchor();
  }, [nodes, selectedNodeId, updateToolbarAnchor]);

  useEffect(() => {
    setHelpOpen(false);
    setPendingDeleteId(null);
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
      updateToolbarAnchor();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateToolbarAnchor]);

  useOnViewportChange({
    onChange: () => updateToolbarAnchor(),
    onEnd: () => updateToolbarAnchor()
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

      applyZoomStep(delta < 0 ? 1 : -1);
    },
    [activeFileId, applyZoomStep, getViewport, normaliseWheelDelta, scheduleGraphSave, setViewport]
  );

  useEffect(() => {
    refreshZoom();
  }, [refreshZoom]);

  useEffect(() => {
    if (!activeFileId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodesRef.current.filter((node) => node.selected);
        const selectedEdges = edgesRef.current.filter((edge) => edge.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
          return;
        }

        event.preventDefault();

        if (selectedNodes.length === 1) {
          const node = selectedNodes[0];
          const data = (node.data as ScreepsNodeData) ?? {
            kind: '',
            label: '',
            family: 'flow',
            config: {}
          };
          const definition = NODE_DEFINITION_MAP[data.kind];
          const requiresConfirm = definition
            ? stableStringify(data.config ?? {}) !== stableStringify(definition.defaultConfig ?? {})
            : false;

          if (requiresConfirm) {
            setSelectedNodeId(node.id);
            setPendingDeleteId(node.id);
            return;
          }

          deleteNodeById(node.id);
        } else if (selectedNodes.length > 1) {
          selectedNodes.forEach((node) => deleteNodeById(node.id));
        }

        if (selectedEdges.length > 0) {
          setEdges((current) => current.filter((edge) => !edge.selected));
          scheduleGraphSave();
        }

        return;
      }

      if (!selectedNodeId) {
        return;
      }

      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        handleToggleEdit();
        return;
      }

      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        handleDuplicateNode();
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeFileId,
    deleteNodeById,
    handleDuplicateNode,
    handleToggleEdit,
    scheduleGraphSave,
    selectedNodeId,
    setPendingDeleteId,
    setEdges,
    setSelectedNodeId
  ]);

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
  const selectedData = selectedNode?.data as ScreepsNodeData | undefined;
  const selectedDefinition = useMemo(() => {
    if (!selectedData) {
      return undefined;
    }
    return NODE_DEFINITION_MAP[selectedData.kind];
  }, [selectedData]);
  const selectedMeta = selectedNode
    ? getNodeMeta((selectedNode.data as ScreepsNodeData).kind)
    : undefined;

  const configModified = useMemo(() => {
    if (!selectedDefinition) {
      return false;
    }
    const defaultConfig = selectedDefinition.defaultConfig ?? {};
    const currentConfig = selectedData?.config ?? {};
    return stableStringify(currentConfig) !== stableStringify(defaultConfig);
  }, [selectedData?.config, selectedDefinition]);

  const helpMarkdown = useMemo(() => {
    if (!selectedMeta) {
      return '';
    }
    return getDocMarkdown(selectedMeta.kind);
  }, [selectedMeta]);

  const helpAnchor = useMemo(() => {
    if (!toolbarAnchor) {
      return null;
    }
    return {
      x: toolbarAnchor.left + toolbarAnchor.width / 2,
      y: toolbarPlacement === 'below' ? toolbarAnchor.bottom + 12 : toolbarAnchor.top - 12
    };
  }, [toolbarAnchor, toolbarPlacement]);

  const handleDeleteRequest = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }

    if (configModified) {
      setPendingDeleteId(selectedNodeId);
      return;
    }

    deleteNodeById(selectedNodeId);
  }, [configModified, deleteNodeById, selectedNodeId]);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedNodeId) {
      return;
    }
    deleteNodeById(selectedNodeId);
  }, [deleteNodeById, selectedNodeId]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

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
          style={{ '--grid-size': `${gridVisualGap}px` } as CSSProperties}
          onSelectionChange={handleSelectionChange as any}
          onMoveEnd={() => {
            refreshZoom();
            scheduleGraphSave();
          }}
          onViewportChange={(_viewport: Viewport) => {
            scheduleGraphSave();
          }}
          onNodeDrag={(_, node) => {
            const snapped = snapPosition(node.position);
            setNodes((current) =>
              current.map((existing) =>
                existing.id === node.id
                  ? {
                      ...existing,
                      position: snapped
                    }
                  : existing
              )
            );
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
          <Background gap={gridVisualGap} color="#1c1d1f" lineWidth={1} variant={BackgroundVariant.Lines} />
        </ReactFlow>
      ) : (
        emptyState
      )}
      <NodeToolbar
        anchor={toolbarAnchor}
        placement={toolbarPlacement}
        zoom={zoomValue}
        visible={Boolean(selectedNodeId && toolbarAnchor)}
        editing={Boolean(selectedData?.editing)}
        confirmVisible={pendingDeleteId === selectedNodeId}
        hasCustomConfig={configModified}
        onEdit={handleToggleEdit}
        onDuplicate={handleDuplicateNode}
        onHelp={() => setHelpOpen(true)}
        onDelete={handleDeleteRequest}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />
      <NodeHelpPopover
        open={helpOpen && Boolean(selectedMeta)}
        anchor={helpAnchor}
        title={selectedMeta?.title ?? ''}
        markdown={helpMarkdown}
        onClose={() => setHelpOpen(false)}
      />
      <BottomMenu
        activeCategory={activeCategory}
        onToggle={handleCategoryToggle}
        onSpawn={handleSpawnNode}
        disabled={!activeFileId}
        zoomDisplay={zoomDisplay}
        onZoomIn={() => applyZoomStep(1)}
        onZoomOut={() => applyZoomStep(-1)}
        onZoomReset={handleZoomReset}
        onZoomFit={handleZoomFit}
      />
    </div>
  );
};

export const CanvasEditor = () => (
  <ReactFlowProvider>
    <CanvasEditorInner />
  </ReactFlowProvider>
);
