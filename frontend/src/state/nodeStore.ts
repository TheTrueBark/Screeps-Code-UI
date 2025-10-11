import { nanoid } from 'nanoid';
import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';

type GraphState = {
  nodes: Node[];
  edges: Edge[];
};

interface NodeStoreState {
  graphs: Record<string, GraphState>;
  initializeGraphForFile: (fileId: string) => void;
  setGraphState: (fileId: string, nodes: Node[], edges: Edge[]) => void;
  getGraphForFile: (fileId: string | null) => GraphState;
  serializeGraph: (
    fileId: string
  ) => {
    nodes: Array<{
      id: string;
      type: string | undefined;
      position: { x: number; y: number };
      data: Node['data'];
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }>;
  };
}

const emptyGraph: GraphState = {
  nodes: [],
  edges: []
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
        [fileId]: emptyGraph
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
        type: node.type,
        position: node.position,
        data: node.data
      })),
      edges: graph.edges.map((edge) => ({
        id: edge.id ?? nanoid(),
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null
      }))
    };
  }
}));

export type { GraphState };
