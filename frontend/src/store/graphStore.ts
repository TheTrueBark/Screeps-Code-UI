import { create } from 'zustand';
import type { Edge, Node } from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { GraphDefinition } from '@shared/types';

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  setElements: (nodes: Node[], edges: Edge[]) => void;
  toSerializableGraph: () => GraphDefinition;
}

// Zentraler Zustand für den Graph. Xyflow liefert Nodes/Edges, die wir hier in eine
// serialisierbare Struktur überführen, damit der Compiler sie konsumieren kann.
export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  setElements: (nodes, edges) => set({ nodes, edges }),
  toSerializableGraph: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: (node.type as string) as GraphDefinition['nodes'][number]['type'],
        position: node.position,
        data: node.data ?? {}
      })),
      edges: edges.map((edge) => ({
        id: edge.id ?? nanoid(),
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? undefined,
        targetHandle: edge.targetHandle ?? undefined
      }))
    };
  }
}));
