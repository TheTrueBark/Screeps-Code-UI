import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';
import type { GraphState, GraphNodeData } from '@shared/types';
import type { ScreepsNodeData } from '../components/editor/NodeTypes/BaseNode';
import { NODE_DEFINITION_MAP } from '../components/editor/nodeRegistry';

interface FlowGraphState {
  nodes: Node<ScreepsNodeData>[];
  edges: Edge[];
}

interface NodeStoreState {
  graphs: Record<string, FlowGraphState>;
  initializeGraphForFile: (fileId: string) => void;
  setGraphState: (fileId: string, nodes: Node<ScreepsNodeData>[], edges: Edge[]) => void;
  getGraphForFile: (fileId: string | null) => FlowGraphState;
  serializeGraph: (fileId: string) => GraphState;
}

const emptyGraph: FlowGraphState = {
  nodes: [],
  edges: []
};

const cloneConfig = (config: Record<string, unknown> | undefined) =>
  JSON.parse(JSON.stringify(config ?? {}));

const createNode = (
  kind: string,
  position: { x: number; y: number },
  overrides?: Partial<ScreepsNodeData['config']>
): Node<ScreepsNodeData> => {
  const definition = NODE_DEFINITION_MAP[kind];
  if (!definition) {
    throw new Error(`Unknown node kind: ${kind}`);
  }

  return {
    id: `${definition.type}-${nanoid(6)}`,
    type: definition.type,
    position,
    data: {
      kind: definition.kind,
      label: definition.title,
      family: definition.family,
      config: {
        ...cloneConfig(definition.defaultConfig as Record<string, unknown>),
        ...(overrides ?? {})
      }
    }
  };
};

const createHarvesterGraph = (): FlowGraphState => {
  const start = createNode('flow.start', { x: 0, y: 0 }, { label: 'Tick Entry' });
  const findSources = createNode('query.find', { x: 0, y: 160 }, {
    findConstant: 'FIND_SOURCES',
    mode: 'first',
    limit: 1
  });
  const splitter = createNode('flow.split', { x: 0, y: 320 }, { branches: 2 });
  const condition = createNode('flow.if', { x: 260, y: 320 }, {
    condition: 'creep.store.getFreeCapacity() === 0'
  });
  const transfer = createNode('creep.transfer', { x: 520, y: 300 }, {
    resource: 'RESOURCE_ENERGY',
    fallback: 'moveTo'
  });
  const callTask = createNode('task.call', { x: 520, y: 460 }, {
    taskName: 'refill',
    args: { min: 50 }
  });
  const harvest = createNode('creep.harvest', { x: -260, y: 340 }, { fallback: 'moveTo' });
  const defineTask = createNode('task.define', { x: 260, y: 120 }, {
    taskName: 'refill',
    params: [{ key: 'min', type: 'number', default: 50 }]
  });
  const returnNode = createNode('flow.return', { x: 520, y: 120 }, { value: 'undefined' });

  const edges: Edge[] = [
    { id: nanoid(), source: start.id, target: findSources.id, sourceHandle: 'flow:out', targetHandle: 'flow:in' },
    { id: nanoid(), source: findSources.id, target: splitter.id, sourceHandle: 'flow:out', targetHandle: 'flow:in' },
    { id: nanoid(), source: findSources.id, target: harvest.id, sourceHandle: 'data:result', targetHandle: 'input:target' },
    { id: nanoid(), source: findSources.id, target: transfer.id, sourceHandle: 'data:result', targetHandle: 'input:target' },
    { id: nanoid(), source: splitter.id, target: condition.id, sourceHandle: 'slot:branch-0', targetHandle: 'flow:in' },
    { id: nanoid(), source: splitter.id, target: harvest.id, sourceHandle: 'slot:branch-1', targetHandle: 'flow:in' },
    { id: nanoid(), source: condition.id, target: transfer.id, sourceHandle: 'slot:true', targetHandle: 'flow:in' },
    { id: nanoid(), source: condition.id, target: harvest.id, sourceHandle: 'slot:false', targetHandle: 'flow:in' },
    { id: nanoid(), source: transfer.id, target: callTask.id, sourceHandle: 'flow:out', targetHandle: 'flow:in' },
    { id: nanoid(), source: defineTask.id, target: returnNode.id, sourceHandle: 'slot:body', targetHandle: 'flow:in' }
  ];

  return {
    nodes: [start, findSources, splitter, condition, transfer, callTask, harvest, defineTask, returnNode],
    edges
  };
};

const createHaulerGraph = (): FlowGraphState => {
  const start = createNode('flow.start', { x: 0, y: 0 }, { label: 'Hauler Entry' });
  return {
    nodes: [start],
    edges: []
  };
};

const initialGraphForFile = (fileId: string): FlowGraphState => {
  if (fileId === 'roles-harvester') {
    return createHarvesterGraph();
  }

  if (fileId === 'roles-hauler') {
    return createHaulerGraph();
  }

  return emptyGraph;
};

export const useNodeStore = create<NodeStoreState>((set, get) => ({
  graphs: {},
  initializeGraphForFile: (fileId) => {
    const { graphs } = get();
    if (graphs[fileId]) {
      return;
    }

    set({
      graphs: {
        ...graphs,
        [fileId]: initialGraphForFile(fileId)
      }
    });
  },
  setGraphState: (fileId, nodes, edges) => {
    const { graphs } = get();
    set({
      graphs: {
        ...graphs,
        [fileId]: {
          nodes,
          edges
        }
      }
    });
  },
  getGraphForFile: (fileId) => {
    if (!fileId) {
      return emptyGraph;
    }

    const { graphs } = get();
    return graphs[fileId] ?? emptyGraph;
  },
  serializeGraph: (fileId) => {
    const { graphs } = get();
    const graph = graphs[fileId] ?? emptyGraph;

    return {
      nodes: graph.nodes.map((node) => ({
        id: node.id,
        type: node.type as string,
        position: node.position,
        data: node.data as GraphNodeData
      })),
      edges: graph.edges.map((edge) => ({
        id: edge.id ?? nanoid(),
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null
      }))
    } satisfies GraphState;
  }
}));

export type { FlowGraphState };
